---
title: "Probabilistic Strategy Game"
date: 2023-05-04
type: "academic"
categories: ["Games"]
tags: ["Games", "Strategy", "Strategy Games", "Simulation", "Infantry Battles", "Wargame"]
image: "image.png"
reverseGrid: false
fileVariants:
  - title: "Probabilistic Strategy Game Final Report"
    url: "https://drive.google.com/file/d/12WKh5G04v2duagzRiQAuSiVPYm9SXbza/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=12WKh5G04v2duagzRiQAuSiVPYm9SXbza&export=download"
    image: "image.png"
  - title: "Probabilistic Strategy Game Code"
    url: "https://github.com/MiroKeimioniemi/probabilistic-strategy-game"
    downloadUrl: "https://github.com/MiroKeimioniemi/probabilistic-strategy-game"
    image: "strategy-game-interface.png"
  - title: "Probabilistic Strategy Game General Plan"
    url: "https://drive.google.com/file/d/1D9_b_9gocDSIUQsKPqDhDGa79Wmvl8n5/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=1D9_b_9gocDSIUQsKPqDhDGa79Wmvl8n5&export=download"
    image: "strategy-game-general-plan.png"
  - title: "Probabilistic Strategy Game Technical Plan"
    url: "https://drive.google.com/file/d/19IfrD7HgVCtugu1GuR_ewhLTnPtmy-Dt/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=19IfrD7HgVCtugu1GuR_ewhLTnPtmy-Dt&export=download"
    image: "strategy-game-technical-plan.png"
  - title: "Probabilistic Strategy Game Miscellaneous Design Notes"
    url: "https://drive.google.com/file/d/1B8D-0QQPg1XcejZj_-8hzxhVMnfS7KLA/view"
    downloadUrl: "https://drive.usercontent.google.com/u/0/uc?id=1B8D-0QQPg1XcejZj_-8hzxhVMnfS7KLA&export=download"
    image: "strategy-game-miscellaneous-design-notes.png"
bsky: "https://bsky.app/profile/mirokeimioniemi.com/post/3md6gd5aizh2h"
---

<p class="body-text">The untitled probabilistic strategy game is a probabilistic battle simulator, aiming to capture the uncertainty of traversing and engaging in combat on unknown territory against unknown enemies. The game mode is conquest, where two players compete for dominance over the objective tiles (dark grey dotted ones in the middle of the GUI picture) until either one has controlled them for a total of 100 turns with various types of units such as foot soldiers, tanks and snipers with different attributes such as damage, weight, size, range and health. These attributes determine the probabilities of a given unit being able to enter a given terrain and triumphing over another in battle.</p>

<p class="body-text">To give the player some agency and a chance to show and develop their strategic competency as the commander of their troops, at the very core of the game is the idea of conditional actions consisting of primary and secondary actions and their respective targets. Each action target has an associated probability calculated based on the type of action and attributes of both the agent and the target. (These will be discussed in more detail in the algorithms section) The player may select any of their battle units by left clicking it with their mouse and choose a primary action for it from the dropdown menu on the right GUI pane, that gets highlighted in grey on the grid as shown in the picture below. This instantly prompts the player to choose a secondary action as well, which is highlighted in a light brown shade.</p>

<p class="body-text">Both actions are by default “Move” but may be mixed and matched in any combination. Target selection for the primary action is highlighted in red and secondary target selection is highlighted in yellow. Once both actions and targets (coordinates next to selected actions) are selected, the “Set Action set” button can be clicked to save the action set for the selected battle unit. Once action sets are set for all desired units, “Play Turn” calculates the outcomes and updates the game state accordingly. Only if the primary action fails is the secondary action even attempted. It is entirely possible that both actions fail, whereas only one can ever succeed at once. Every unit can be assigned an action set during a turn so that with the default game launch configuration at most seven action sets will be executed at once.</p>

<p class="body-text">Attacking an enemy battle unit always launches a duel where, based on the unit types, their experience and damage gradients (distance between), the loser suffers all the damage, whereas the winner stays unscathed. Attacking a terrain tile on the other hand degrades it so that its attributes change, making it easier or harder to traverse. If sufficient explosive damage is dealt to, for example, a rock, it will turn into gravel. The environment is therefore destructible. However, only tanks can degrade rocks. Moving simply places the battle unit in the new coordinates within its range. However, if these contain another battle unit, should the move be successful, the moving unit will ram them and be placed on top of the now destroyed enemy unit. Defend activates a temporary effect that reduces the damage taken by the defending battle unit to half in case it loses a battle while defending. The effect will persist until it moves or attacks something proactively.</p>

<p class="body-text">The other two actions are Rest and Reload, replacing the supply chain mechanic, which was foregone due to lack of time and potentially resulting in overcrowding of the GUI. Rest restores a battle unit’s fuel to its maximum while staying still for one round and Reload restores its ammo to its maximum such that there is an aspect of resource management as well.</p>

<p class="body-text">See the code on <a href="https://github.com/MiroKeimioniemi/probabilistic-strategy-game" target="_blank" class="hyperlink-style">GitHub</a>.</p>
