# Evaluation results

2026-10-05T10:50:51.707Z · model `claude-haiku-4-5-20251001` · 34 labelled images × 3 runs · folder `eval/images`

| Approach | Correct or correctly abstained | Consistent across runs | Median latency | p95 latency | Cost per image |
|---|---|---|---|---|---|
| Alaa: closed list, forced tool call | 81/102 (79%) | 33/34 (97%) | 1.7 s | 2.2 s | $0.00412 |
| Alternative: free labels + manual mapping | 90/102 (88%) | 34/34 (100%) | 1.5 s | 2.0 s | $0.00195 |

## Per image

### constrained

| Image | Expected | Runs | First decision |
|---|---|---|---|
| Acer_SF114-32_keyboard_closeup.jpg | abstain | ✓✓✓ | abstain |
| Blue_sky_white_clouds_looking_up_at_trees.jpg | sky / tree | ✓✓✓ | confirm sky/cloud/tree |
| Bubbles_in_glass_of_water.jpg | drinking_water / water | ✓✓✓ | card drinking_water |
| Dates_on_date_palm.jpg | date_fruit / palm_tree | ✓✓✓ | card date_fruit |
| Glass_of_Water.jpeg | drinking_water / water | ✓✓✓ | card drinking_water |
| Sky_clouds.jpeg | sky | ✓✓✓ | card sky |
| ambiguous__bokeh_lights__px6296462.jpg | abstain | ✗✗✗ | card night |
| ambiguous__bottle_on_beach__px7981599.jpg | abstain / sea / water | ✓✓✓ | confirm bottle/sea/daytime |
| ambiguous__tree_bark__px37024589.jpg | abstain / tree | ✓✓✓ | card tree |
| blessing__crops_grain__px16222126.jpg | wheat / grain | ✓✓✓ | confirm wheat/tree/daytime |
| blessing__date_fruit__px17877978.jpg | date_fruit | ✗✗✗ | card grain |
| blessing__date_palm__px18331921.jpg | palm_tree / date_fruit | ✓✓✓ | card palm_tree |
| blessing__drinking_water__px13464445.jpg | drinking_water / water | ✓✓✓ | card drinking_water |
| blessing__moon__px10531646.jpg | moon | ✓✓✓ | card moon |
| blessing__pearls__px5357486.jpg | pearl | ✓✓✓ | card pearl |
| blessing__pen_writing__px35522712.jpg | pen / handwriting | ✓✓✓ | card handwriting |
| blessing__pomegranate__px12148143.jpg | pomegranate | ✓✓✓ | card pomegranate |
| blessing__sea__px9314030.jpg | sea | ✓✓✓ | card sea |
| blessing__ship__px15944128.jpg | ship / sea | ✓✓✓ | confirm ship/sea/mountain |
| blessing__sunlight__px28486391.jpg | sun / tree | ✓✓✓ | confirm tree/sun/daytime |
| blessing__tree__px33526769.jpg | tree | ✓✓✓ | card tree |
| my_hand.png | hand | ✓✓✓ | card hand |
| noverse__keyboard__px18641167.jpg | abstain | ✓✓✓ | abstain |
| noverse__laptop__px8534240.jpg | abstain | ✗✗✗ | confirm laptop/plant/daytime |
| noverse__sofa__px6758245.jpg | abstain | ✓✓✓ | abstain |
| offlist__bicycle__px12470022.jpg | abstain | ✗✗✗ | confirm bicycle/grass/sky |
| offlist__headphones__px210927.jpg | abstain | ✓✓✓ | abstain |
| offlist__scissors__px20785313.jpg | abstain | ✓✓✓ | abstain |
| offlist__sneakers__px1027130.jpg | abstain | ✓✓✓ | abstain |
| offlist__umbrella__px39993697.jpg | abstain | ✗✗✗ | confirm umbrella/window/house |
| person__face__px39087408.jpg | abstain | ✗✗✗ | confirm eye |
| person__hand_dates__px37514842.jpg | hand / date_fruit / palm_tree | ✓✓✓ | card hand |
| two__laptop-and-pen__px9263102.jpg | pen / handwriting | ✓✓✓ | confirm laptop/pen/paper |
| two__water-and-dates__px8164799.jpg | drinking_water / water / date_fruit | ✗✗✗ | confirm hand |

### alt

| Image | Expected | Runs | First decision |
|---|---|---|---|
| Acer_SF114-32_keyboard_closeup.jpg | abstain | ✓✓✓ | abstain (named: computer keyboard, function keys, laptop keyboard with blue accents) |
| Blue_sky_white_clouds_looking_up_at_trees.jpg | sky / tree | ✓✓✓ | confirm tree/cloud/sky (named: tree branches with leaves, clouds, blue sky) |
| Bubbles_in_glass_of_water.jpg | drinking_water / water | ✓✓✓ | card water (named: glass of carbonated water, bubbles, clear liquid) |
| Dates_on_date_palm.jpg | date_fruit / palm_tree | ✓✓✓ | confirm palm_tree/sky (named: date palm fruit clusters, palm tree branches, blue sky) |
| Glass_of_Water.jpeg | drinking_water / water | ✓✓✓ | card water (named: wine glass with water splashing, water stream, black background) |
| Sky_clouds.jpeg | sky | ✓✓✓ | card sky (named: clouds, blue sky) |
| ambiguous__bokeh_lights__px6296462.jpg | abstain | ✓✓✓ | abstain (named: bokeh lights, blurred light circles, Christmas lights) |
| ambiguous__bottle_on_beach__px7981599.jpg | abstain / sea / water | ✓✓✓ | confirm bottle/desert/sea (named: plastic bottle, sand, ocean wave) |
| ambiguous__tree_bark__px37024589.jpg | abstain / tree | ✓✓✓ | card tree (named: tree bark, wood texture, lichen or moss) |
| blessing__crops_grain__px16222126.jpg | wheat / grain | ✓✓✓ | confirm wheat/sky/tree (named: wheat field, bare trees, blue sky with clouds) |
| blessing__date_fruit__px17877978.jpg | date_fruit | ✗✗✗ | abstain (named: cacao pods, blue container, dried cocoa beans) |
| blessing__date_palm__px18331921.jpg | palm_tree / date_fruit | ✓✓✓ | confirm palm_tree/sky (named: palm tree, date clusters, blue sky) |
| blessing__drinking_water__px13464445.jpg | drinking_water / water | ✓✓✓ | card drinking_water (named: glass of water, glass of water, glass of water) |
| blessing__moon__px10531646.jpg | moon | ✓✓✓ | card moon (named: full moon) |
| blessing__pearls__px5357486.jpg | pearl | ✓✓✓ | card pearl (named: pearl necklace) |
| blessing__pen_writing__px35522712.jpg | pen / handwriting | ✓✓✓ | card pen (named: spiral notebook with handwritten text, pen, ink bottle) |
| blessing__pomegranate__px12148143.jpg | pomegranate | ✓✓✓ | card pomegranate (named: pomegranate, pomegranate seeds, wooden surface) |
| blessing__sea__px9314030.jpg | sea | ✓✓✓ | confirm sea/sky (named: ocean waves, sandy beach, cloudy sky) |
| blessing__ship__px15944128.jpg | ship / sea | ✓✓✓ | confirm ship/sea/mountain (named: cargo ship, ocean waves, mountains) |
| blessing__sunlight__px28486391.jpg | sun / tree | ✓✓✓ | confirm tree/grass/sun (named: trees, grass field, sun) |
| blessing__tree__px33526769.jpg | tree | ✓✓✓ | confirm tree/leaf/sky (named: tree branches, green leaves, blue sky) |
| my_hand.png | hand | ✓✓✓ | card hand (named: open hand, human palm, fingers) |
| noverse__keyboard__px18641167.jpg | abstain | ✓✓✓ | abstain (named: computer keyboard, Windows key, keyboard keys) |
| noverse__laptop__px8534240.jpg | abstain | ✓✓✓ | abstain (named: laptop computer, ceramic vase, wooden sculpture) |
| noverse__sofa__px6758245.jpg | abstain | ✓✓✓ | abstain (named: sofa with cushions, potted plants, coffee table) |
| offlist__bicycle__px12470022.jpg | abstain | ✗✗✗ | confirm bicycle/grass/sky (named: bicycle, grass field, sky) |
| offlist__headphones__px210927.jpg | abstain | ✓✓✓ | abstain (named: over-ear headphones, audio cable, leather headband) |
| offlist__scissors__px20785313.jpg | abstain | ✓✓✓ | abstain (named: hair scissors, barber clippers, wooden table) |
| offlist__sneakers__px1027130.jpg | abstain | ✓✓✓ | abstain (named: red sneakers, athletic shoes, shoe display stand) |
| offlist__umbrella__px39993697.jpg | abstain | ✓✓✓ | abstain (named: yellow and orange umbrella, wooden window with panes, concrete wall) |
| person__face__px39087408.jpg | abstain | ✓✓✓ | abstain (named: man with black hair, checkered shirt, blurred background with colorful signs) |
| person__hand_dates__px37514842.jpg | hand / date_fruit / palm_tree | ✗✗✗ | abstain (named: hand holding olives, palm trees, grass field) |
| two__laptop-and-pen__px9263102.jpg | pen / handwriting | ✓✓✓ | confirm laptop/orange_fruit/pen (named: laptop, orange sticky note, pen) |
| two__water-and-dates__px8164799.jpg | drinking_water / water / date_fruit | ✗✗✗ | abstain (named: glass of water, decorative tray, pastries or baked goods) |

