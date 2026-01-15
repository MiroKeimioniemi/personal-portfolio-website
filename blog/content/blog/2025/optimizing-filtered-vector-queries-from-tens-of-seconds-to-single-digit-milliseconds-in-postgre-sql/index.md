---
title: "Optimizing filtered vector queries from tens of seconds to single-digit milliseconds in PostgreSQL"
date: 2025-11-04
type: "blog"
categories: ["Software Development"]
tags: ["SQL", "PostgreSQL", "Optimization", "pgvector", "Python", "SQLAlchemy"]
highlight: true
bsky: "https://bsky.app/profile/mirokeimioniemi.com/post/3mcgdxhpe7z26"
---

Vectors have exploded in popularity as the datatype enabling semantic search, which powers all kinds of AI applications ranging from standard RAG systems to fully agentic applications. Our job and candidate recommendation algorithms at [Clarvo](https://clarvo.ai) also get their input via filtered vector queries, which can, however, be notoriously difficult to work with due to how differently vector indexes work in comparison to the regular B-trees, hash maps, GIN indexes etc. 

In fact, effectively filtering vector queries can be so tricky that despite many of its major benefits, including no additional costs, a simple getting started process and direct integration into PostgreSQL, [some argue against using pgvector altogether](https://alex-jacobs.com/posts/the-case-against-pgvector/) and opting for dedicated vector databases instead, partially on that basis.

We were adding a lot of candidate profiles for recruiters to search, happily relying on our HNSW vector indexes in combination with various other filters to obtain only the most relevant results until we noticed our query times increasing linearly with the number of profiles in our database. 

This triggered a rush to fix the SQL queries to eliminate a crucial bottleneck that would sometimes even time out some of the most complex queries, which resulted from the fact that the HNSW vector index was not actually being used by any of the queries almost ever due to incorrect SQL query structure and excessive complexity. 

Here are some of the best practices I learned for working with the [pgvector](https://github.com/pgvector/pgvector) PostgreSQL extension while optimizing our queries' performance from up to tens of seconds down to single-digit milliseconds:

### 1. Vector indexes are fast. 

You can expect query times of 1-2ms for finding the top 500 approximate nearest neighbors from hundreds of thousands of HNSW-indexed 1 536-dimensional vectors when the index is defined with `vector_ip_ops` and loaded in memory. Knowing what to expect gives you a guideline for what to aim for: Never be satisfied with anything over 100ms, even with post-filtering applied! 
   
### 2. Note that HNSW indexes must be stored entirely in memory for their speed to truly be manifest. 

This means that in order to keep it fast, RAM must be scaled with the number of vectors in the index. You can look into, for example, [pg_prewarm](https://www.postgresql.org/docs/current/pgprewarm.html) for how to do this in such a manner that the index is always available without cold start issues. 
   
### 3. Define the index using `vector_ip_ops` if your vectors are normalized and your similarity metric is cosine similarity. 

This allows you to use the slightly faster negative inner product `<#>` when querying the index, which is equivalent to cosine similarity when the vectors are normalized. Read more about the HNSW index and how it compares to IVFFlat [here](https://medium.com/@bavalpreetsinghh/pgvector-hnsw-vs-ivfflat-a-comprehensive-study-21ce0aaab931).
   
   ```SQL
	CREATE EXTENSION IF NOT EXISTS vector;
	
	CREATE INDEX embedding_idx
	ON "public"."embedding_table"
	USING hnsw (embedding vector_ip_ops)
	WITH (
	    m = 16,      -- Number of connections per layer (default: 16)
	    ef_construction = 64  -- Size of the dynamic candidate list (default: 64)
	)
	WHERE embedding IS NOT NULL AND boolean_condition IS TRUE AND category = 'category';
```
   
   The WHERE clause here is unnecessary for a standard vector index, but is included as an example for how to define partial vector indexes, meaning that the index is constructed over only those rows that fulfill certain conditions. Note that if `category` had, e.g., 4 different enum values it could take and you wanted partial indexes over all of those, you would have to define four separate indexes; one for each enum value. This can make a lot of sense if there are only a few categories and the filter is present for most queries. 

### 4. With PostgreSQL and pgvector, the only realistic choice for combining regular filters with vector indexes is post-filtering

This means that the HNSW index is always traversed first to obtain a candidate set, which is then filtered down to adhere to the requirements. The HNSW graph must always stay fully connected for the index to work and thus, if you want to utilize it, it must always be allowed to be the main character of the query. 
   
   Some vector databases implement integrated filtering, which increases performance further, but for this you will have to open pull requests to pgvector implementing them yourself. The third option often mentioned is "pre-filtering". However, this is a misleading term because it refers to simply skipping the vector index altogether, which can make sense for highly selective filters, but cannot really be called a **vector** filtering strategy at all in my opinion.
   
### 5. Iterative scan is your best friend when post-filtering vector queries. 

Post-filtering sounds inefficient and thus slow, the former of which can be true for highly selective filters, but it can be very fast regardless, when done correctly. Typically, rather than speed, the key issue with it is to do sufficient oversampling, such that the resulting set contains enough results after the filters have been applied. Iterative scan is pgvector's solution to obtaining the desired number of overall results regardless of the selectivity of the filters; it automatically retrieves candidate sets and applies your filters to them in a loop while systematically traversing the HNSW graph deeper as more candidates are required until the desired number is reached.
   
### 6. Make sure to structure the query correctly with ORDER BY being the last clause followed only by LIMIT. 

This is what enables iterative scan to work. Try to keep it as simple as possible to maximize the likelihood of the query planner choosing the HNSW index. Below is an example query structure written in Python using SQLAlchemy that mirrors our query structure: 
   
```Python
   embedding_expr = f"[{','.join(str(1.0) for _ in range(1536))}]"
   
   distance_expr = literal_column(f'("embedding_table"."embedding"::vector <#> {embedding_expr}::vector)').label("distance")
   
   select(
		embedding_table.id,
		distance_expr,
		filter_table.column1,
		filter_table.column2,
	)
	.select_from(embedding_table)
	.join(data_table, data_table.id == embedding_table.id)
	.join(filter_table, filter_table.id == embedding_table.id)
	.where(
		embedding_table.type == embedding_type.overall,
		embedding_table.embedding.isnot(None),
		...
	)
	.order_by(distance_expr).limit(500)
   ```
   
   And below is the above SQLAlchemy query as raw SQL:
   
```SQL
   SELECT
	    t1.id,
	    (t1.embedding::vector <#> '[1.0,1.0,1.0,...,1.0]'::vector) AS distance,
	    t3.column1,
	    t3.column2
	FROM
	    embedding_table AS t1
	JOIN
	    data_table AS t2
	    ON t2.id = t1.id
	JOIN
	    filter_table AS t3
	    ON t3.id = t1.id
	WHERE
	    t1.type = 'overall'
	    AND t1.embedding IS NOT NULL
	    AND ...
	ORDER BY
	    distance
	LIMIT 500;
```
   
   The queries above are not minimal, but rather examples of the general, working structure of real queries we are making: start with SELECT, do the necessary joins (we have separated the  data of interest and its embeddings into separate tables, in addition to which we have a table with various aggregate measures and other denormalized columns exclusively for the purposes of efficient filtering), chain all the WHERE conditions with AND connectives and finally ORDER BY the distance expression `table_embedding::vector <#> query_embedding::vector`, where `<#>` corresponds to the negative inner product, meaning that you will have to multiply it by -1 to get the similarity, and `::vector` ensures proper casting of the vectors, where the query vector can be provided as a string. Use LIMIT to specify the number of results you want to return, so that iterative scan keeps on iterating until the specified number or `hnsw.max_scan_tuples` is reached.
   
   If you use SQLAlchemy or a similar ORM to dynamically build the queries in modular fashion, make sure to always extend the base query directly by appending WHERE conditions directly to the overall statement and apply the ORDER_BY and LIMIT as the final step after all these conditions are applied: `.where(condition).where(another_condition)` is equivalent to `.where(condition, another_condition)`. I found the dynamic query building pattern below to be highly effective in balancing readability, extendibility and query performance:
   
   ```Python
   stmt = select(
		table.id,
		distance_expr,
	)
	.select_from(table)
	.where(
		table.type == embedding_type.overall,
		table.embedding.isnot(None),
	)
	
	def build_positive_only_condition(stmt, filters):
		if filters.condition1 == True:
			stmt.where(table.number_value >= 0)
		return stmt
	
	def build_another_condition(stmt, filters):
		...
		stmt.where(...)
		return stmt
		
	stmt = build_positive_only_condition(stmt, filters)
	stmt = build_another_condition(stmt, filters)
	
	stmt = stmt.order_by(distance_expr).limit(500)
	
	results = db.execute(stmt).all()
   ```

### 7. Make the WHERE conditions as simple as possible. 

Simple equalities and inequalities are the best, while the EXISTS pattern is very effective for filtering based on normalized relations, i.e., columns in other tables not included in the base query, which can avoid expensive joins and terminate early with minimal data movement:
   
   ```Python
   exists_condition = exists(
	    select(literal(1))
	    .select_from(RelatedTable)
	    .where(
	        and_(
	            RelatedTable.userId == User.id,
	            RelatedTable.filterColumn.in_(filter_values)
	        )
	    )
	)
	stmt = stmt.where(exists_condition)
   ```
   
   ```SQL
   WHERE EXISTS (
	    SELECT 1
	    FROM "RelatedTable" rt
	    WHERE rt.user_id = u.id
	      AND rt.filter_column IN (:values)
	)
   ```
   
   You can also denormalize the most commonly used data by including the columns which are most frequently filtered over in, for example, the same table with the embedding, so that the WHERE conditions can be made up only of the simplest, direct comparisons. This can help radically simplify the query and therefore guide the query planner to use the vector index almost always, when there are no alternative paths apart from choosing different indexes for the same table.  

### 8. Always use EXPLAIN (ANALYZE, BUFFERS, VERBOSE, COSTS, TIMING) for thorough analysis 

Use this to understand the queries built by the query planner and ensure that the HNSW index is correctly utilized.  The query planner may sometimes skip the vector index even for perfectly optimized queries depending on the selectivity of the provided parameters. It is thus important to test the filters in isolation with only the vector index, with values of high and low selectivity to see that their specific implementations are compatible with iterative scan and only then test all the filters together. 
   
   The more different filters you use for the same query, the less you should expect the vector index to be utilized, even if they are all individually compatible with it, because the added complexity provides the query planner many more routes to take. You can nudge these by adjusting the cost estimations of different read operations on a database level, but I would be wary of touching these unless you know exactly what you are doing and what the hardware on which your database is running on is capable of.

### 9. Vector quantization and table partitioning

Next steps for us include implementing vector compression and table partitioning, which I will be sure to write about when we get to it. Vector compression techniques such as binary-, scalar-, product- and rotational quantization enable anywhere from 4x to 32x smaller memory footprints for vector embeddings with different recall tradeoffs, speeding up computations and reducing necessary storage size. The vector dimensions can also be reduced by, for example, using the pgvector `halfvec` type, which can multiply those multipliers by further 2x. I will report back to what we discover when we get to it.

Further reading:

- https://yudhiesh.github.io/2025/05/09/the-achilles-heel-of-vector-search-filters/
- https://www.thenile.dev/blog/pgvector_myth_debunking
- https://github.com/pgvector/pgvector
- https://medium.com/@bavalpreetsinghh/pgvector-hnsw-vs-ivfflat-a-comprehensive-study-21ce0aaab931
