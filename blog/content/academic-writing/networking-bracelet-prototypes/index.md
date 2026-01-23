---
title: "Networking Bracelet Prototypes"
date: 2023-11-25
type: "academic"
categories: ["Hardware", "Networking", "Prototyping"]
tags: ["Hardware", "Networking", "Prototyping", "Electronics", "Programming", "Arduino"]
image: "networking-bracelet-design-proposal.png"
reverseGrid: false
fileVariants:
  - title: "Networking Bracelet Design Proposal"
    url: "https://drive.google.com/file/d/1kevBMTM0SDHFBS7_gHggONXPHn-6ukpf/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=1kevBMTM0SDHFBS7_gHggONXPHn-6ukpf&export=download"
    image: "networking-bracelet-design-proposal.png"
  - title: "Networking Bracelets Design Document"
    url: "https://drive.google.com/file/d/17mXrruP8UzuokYjS0zhhSNvLL1IMy2_e/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=17mXrruP8UzuokYjS0zhhSNvLL1IMy2_e&export=download"
    image: "networking-bracelets-design-document.png"
  - title: "Networking Bracelets Presentation"
    url: "https://drive.google.com/file/d/1I18igVE7YXuaG82Y3q7p-_ODX1dnK-rd/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=1I18igVE7YXuaG82Y3q7p-_ODX1dnK-rd&export=download"
    image: "networking-bracelet-presentation.png"
bsky: "https://bsky.app/profile/mirokeimioniemi.com/post/3md4v3uq3332x"
---

<p class="body-text">The Networking Bracelet prototypes are a two-bracelet interaction demo that aim to demonstrate what it would be like to use the final product, the idea of which is to encourage and facilitate interesting, spontaneous in-person conversations with the most interesting people at networking events of various kinds.</p>

<p class="body-text">Simply mark people as people of interest from an app or website in a networking event and get notified by vibration and matching light patterns on bracelets every time a mutual interest is encountered.</p>

<p class="body-text">The prototypes were built using Arduino Micros, HC-05 Bluetooth modules and WS2818B LED strips that were programmed with C using the Arduino IDE. The two bracelets were linked in a master-slave configuration where both broadcasted their IDs to each other. If the received ID matched with any item on the list of match IDs, both the internal and received ID were used to randomly generate and display a unique match color pattern until the received ID is incorrect or non-existent.</p>

{{< img src="image.jpg" alt="Networking Bracelet Prototypes" >}}

<p class="body-text">This is not at all scalable or otherwise reminiscent of a practically actionable approach as it only supports two pre-configured bracelets, with only the slave's ID being modifiable using Serial Bluetooth Terminal, but it functions as a good demo for observing how people react and interact with such novel technology.</p>

<p class="body-text">A lot more groundwork has been done in the form of extensive market research, which confirms the idea as unique, and user research, which positively indicates about its potential viability. If the idea sounds compelling to you and you believe you would have something to offer, do not hesitate to reach out!</p>

<p class="body-text">I would be interested in potentially developing the idea further with a co-founder experienced or obsessed with designing, building and/or manufacturing electronics hardware. Get in touch if you fit the profile and are interested!</p>

<p class="body-text">See a demo video on <a href="https://www.youtube.com/watch?v=1mS3KUr62uY" target="_blank" class="hyperlink-style">YouTube</a>.</p>

<p class="body-text">See the post on <a href="https://www.linkedin.com/posts/miro-keimi%C3%B6niemi_now-that-school-is-over-for-the-year-ill-activity-7143994838173089792-r3KP" target="_blank" class="hyperlink-style">LinkedIn</a>.</p>

<p class="body-text">See the code on <a href="https://github.com/MiroKeimioniemi/networking-bracelet-arduino-prototype" target="_blank" class="hyperlink-style">GitHub</a>.</p>
