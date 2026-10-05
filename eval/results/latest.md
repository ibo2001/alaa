# Evaluation results

2026-10-05T11:00:10.290Z · model `claude-haiku-4-5-20251001` · 34 labelled images × 3 runs · folder `eval/images`

| Approach | Correct or correctly abstained | Consistent across runs | Median latency | p95 latency | Cost per image |
|---|---|---|---|---|---|
| Alaa: closed list, forced tool call | 90/102 (88%) | 33/34 (97%) | 1.7 s | 2.1 s | $0.00412 |

## Per image

### constrained

| Image | Expected | Runs | First decision |
|---|---|---|---|
| Acer_SF114-32_keyboard_closeup.jpg | abstain | ✓✓✓ | abstain |
| Blue_sky_white_clouds_looking_up_at_trees.jpg | sky / tree | ✓✓✓ | card sky |
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
| noverse__laptop__px8534240.jpg | abstain | ✓✓✓ | abstain |
| noverse__sofa__px6758245.jpg | abstain | ✓✓✓ | abstain |
| offlist__bicycle__px12470022.jpg | abstain | ✓✓✓ | abstain |
| offlist__headphones__px210927.jpg | abstain | ✓✓✓ | abstain |
| offlist__scissors__px20785313.jpg | abstain | ✓✓✓ | abstain |
| offlist__sneakers__px1027130.jpg | abstain | ✓✓✓ | abstain |
| offlist__umbrella__px39993697.jpg | abstain | ✓✓✓ | abstain |
| person__face__px39087408.jpg | abstain | ✗✗✗ | confirm eye |
| person__hand_dates__px37514842.jpg | hand / date_fruit / palm_tree | ✓✓✓ | card hand |
| two__laptop-and-pen__px9263102.jpg | pen / handwriting | ✓✓✓ | confirm laptop/pen/paper |
| two__water-and-dates__px8164799.jpg | drinking_water / water / date_fruit | ✗✗✗ | confirm hand |

