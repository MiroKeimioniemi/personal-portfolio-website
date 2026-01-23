---
title: "Classifying Software Pirates in the Music Production Software Industry"
date: 2023-12-19
type: "academic"
categories: ["Machine Learning", "Data Analysis", "Research"]
tags: ["Machine Learning", "Data Analysis", "Research", "Aalto"]
image: "image.png"
reverseGrid: false
fileVariants:
  - title: "Classifying Software Pirates in the Music Production Software Industry with full appendices"
    url: "https://drive.google.com/file/d/1QWj-fmSC6Um7Mfzd1aSPNC4ZxTUeh7tA/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=1QWj-fmSC6Um7Mfzd1aSPNC4ZxTUeh7tA&export=download"
    image: "image.png"
  - title: "Classifying Software Pirates in the Music Production Software Industry report"
    url: "https://drive.google.com/file/d/1PiE9hckf81MSYPFXGlsTv2JUuNF9w8qL/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=1PiE9hckf81MSYPFXGlsTv2JUuNF9w8qL&export=download"
bsky: "https://bsky.app/profile/mirokeimioniemi.com/post/3md4v3m3zfx2a"
---

<p class="body-text">This project attempts to dive deeper into the dataset used for the report <a href="https://mirokeimioniemi.com/writing/academic-writing/the-pricing-of-digital-goods-in-the-music-production-software-industry/" target="_blank" class="hyperlink-style">“The Pricing of Digital Goods in the Music Production Software Industry”</a> to try classify people into those who have pirated music production software and to those who have not based on a variety of features. This could then be used to explore the factors driving people into software piracy to gain more insight into this prominent modern phenomenon that extends to all online markets. This information can unlock economic insights into people’s online behavior and help software companies maximize their profits by conducting appropriate customer segmentation, which would likely benefit the customers as well in situations where they have not previously been able to afford the products.</p>

<p class="body-text">Two machine learning models, DecisionTreeClassifier and LogisticRegression were developed to classify software pirates using demographic and similar, one-hot encoded, categorical data. Their performance characteristics were practically identical and thus LogisticRegression was selected due to its better interpretability, which poses that the factors most correlating with online piracy are its ease and the age and residence region of the person, both of which usually directly affect their disposable income. This implies that there might still be more room for further market segmentation in the form of, for example, country-specific pricing and student discounts.</p>

<p class="body-text">The selected Logistic Regression model has an accuracy of 0.729729 and an F1 Score of 0.741379, which is quite good for a dataset this small, biased and noisy. This was enough to reveal and rank overall trends in terms of their approximate influence on the amount of piracy, but the accuracy would be quite poor for a classification system that would mislabel over one fourth of the people considered, which is something to be very careful about. Hence, this project’s focus on the predictive features over the predictions themselves.</p>

<p class="body-text">See the code on <a href="https://github.com/MiroKeimioniemi/classifying-software-pirates" target="_blank" class="hyperlink-style">GitHub</a>.</p>
