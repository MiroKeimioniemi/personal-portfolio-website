---
title: "Determining the optimal timing for insulin injection to minimize glucose level variability after a meal in ideal conditions"
date: 2022-01-15
type: "academic"
categories: ["Mathematics", "Data Analysis", "Research"]
tags: ["Mathematics", "Diabetes", "Research", "Data Analysis", "IB"]
image: "Mathematics exploration-min.png"
reverseGrid: false
fileVariants:
  - title: "Mathematics IA – Determining the optimal timing of insulin injection"
    url: "https://ibdone1.files.wordpress.com/2023/01/mathematics-ia-determining-the-optimal-timing-of-insulin-injection.pdf"
    downloadUrl: "https://ibdone1.files.wordpress.com/2023/01/mathematics-ia-determining-the-optimal-timing-of-insulin-injection.pdf?force_download=true"
    image: "Mathematics exploration-min.png"
  - title: "Mathematics IA – Determining the optimal timing of insulin injection with raw data"
    url: "https://ibdone1.files.wordpress.com/2023/01/mathematics-ia-determining-the-optimal-timing-of-insulin-injection-with-raw-data.pdf"
    downloadUrl: "https://ibdone1.files.wordpress.com/2023/01/mathematics-ia-determining-the-optimal-timing-of-insulin-injection-with-raw-data.pdf?force_download=true"
  - title: "Mathematics IA – Determining the optimal timing of insulin injection with full appendices"
    url: "https://ibdone1.files.wordpress.com/2023/01/mathematics-ia-determining-the-optimal-timing-of-insulin-injection-with-full-appendices.pdf"
    downloadUrl: "https://ibdone1.files.wordpress.com/2023/01/mathematics-ia-determining-the-optimal-timing-of-insulin-injection-with-full-appendices.pdf?force_download=true"
bsky: "https://bsky.app/profile/mirokeimioniemi.com/post/3mcxussf5c72s"
---

<p class="body-text">Determining the optimal timing for insulin injection to minimize glucose level variability after a meal in ideal conditions was a research project for the IB Standard Level Mathematics Analysis and Approaches course inspired by my type 1 diabetes. With type 1 diabetes, there are broadly two major problems that must be solved daily by the diabetic individual: when to eat or inject insulin and how much? Because of the IB's policy on human and animal experimentation, the first question was significantly easier to approach as it could be done by simply modeling the behavior of my glucose levels after said events without modifying anything about my daily routine, a point I had to stress over and over again to get the project approved.</p>

<p class="body-text">The overall method was to isolate the events where I naturally either injected 1 unit of insulin or consumed 10 grams of carbohydrates far enough from eating and exercise from the over 10 000 data points that my dexcom G6 glucose sensor collected over the data collection period. I used statistical methods to model the average behavior of my glucose levels in those events to produce curves (functions) for both types of events with python. Adding together the curves and taking the integral of that graph with different x-offsets of the insulin injection curve then produced the optimal timing with the simplified assumptions that were made. Due to these simplified assumptions and the one person test group, the results are not to be trusted in making medical decisions but the process may be used as inspiration for a better algorithm one day.</p>

<p class="body-text">As a mathematics IA for the International Baccalaureate Diploma Programme, it got 18/20 points, which translates into an overall grade of 7.</p>

<p class="body-text">See it on <a href="https://ibdone1.wordpress.com" target="_blank" class="hyperlink-style">ib-done.com</a>.</p>

<p class="body-text">See the code on <a href="https://github.com/MiroKeimioniemi/optimizing-insulin-injection-timing" target="_blank" class="hyperlink-style">GitHub</a>.</p>
