# Landscape phone audit, 2026-11-19

Made by `node scripts/audit-landscape.mjs`. The same audit after the landscape fix (a phone on its side gets the desktop chrome as a 64px icon rail; see `../2026-11-19-landscape-phone/` for the before). Compare the Free height column.
"Bars" is the height held by fixed or sticky bars (top plus bottom); "free" is what is left for the screen itself; "screens" is the page length in screens of that height (1.0 = no scrolling).

## 844 x 390 (iPhone 14), worst first

| Screen | Top bar | Bottom bar | Side rail | Free height | Screens long | Other | 932x430 free | 667x375 free | Shot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| jobs / planning (squad board) | 64 | 95 | 64 | **231** (59%) | 5.2 | 8 small targets | 271 | 185 | [844x390-18-jobs-planning-squad-board-.png](844x390-18-jobs-planning-squad-board-.png) |
| first load | 64 | 82 | 64 | **244** (63%) | 3.1 | - | 284 | 229 | [844x390-01-first-load.png](844x390-01-first-load.png) |
| founders pick | 64 | 82 | 64 | **244** (63%) | 3.1 | - | 284 | 229 | [844x390-02-founders-pick.png](844x390-02-founders-pick.png) |
| inbox | 69 | 0 | 64 | **321** (82%) | 1.2 | - | 361 | 306 | [844x390-03-inbox.png](844x390-03-inbox.png) |
| inbox / a message | 69 | 0 | 64 | **321** (82%) | 1.2 | 3 small targets | 361 | 306 | [844x390-04-inbox-a-message.png](844x390-04-inbox-a-message.png) |
| city | 69 | 0 | 64 | **321** (82%) | 2 | 10 small targets | 361 | 306 | [844x390-05-city.png](844x390-05-city.png) |
| city / Districts | 69 | 0 | 64 | **321** (82%) | 2.2 | - | 361 | 306 | [844x390-06-city-districts.png](844x390-06-city-districts.png) |
| city / Tongs | 69 | 0 | 64 | **321** (82%) | 5.9 | - | 361 | 306 | [844x390-07-city-tongs.png](844x390-07-city-tongs.png) |
| tong | 69 | 0 | 64 | **321** (82%) | 2.2 | - | 361 | 306 | [844x390-08-tong.png](844x390-08-tong.png) |
| tong / Armoury | 69 | 0 | 64 | **321** (82%) | 8.5 | - | 361 | 306 | [844x390-09-tong-armoury.png](844x390-09-tong-armoury.png) |
| crew | 69 | 0 | 64 | **321** (82%) | 1.6 | - | 361 | 306 | [844x390-10-crew.png](844x390-10-crew.png) |
| crew / Leads | 69 | 0 | 64 | **321** (82%) | 1 | - | 361 | 306 | [844x390-11-crew-leads.png](844x390-11-crew-leads.png) |
| crew / Wall | 69 | 0 | 64 | **321** (82%) | 1 | - | 361 | 306 | [844x390-12-crew-wall.png](844x390-12-crew-wall.png) |
| crew / runner page | 69 | 0 | 64 | **321** (82%) | 4.5 | - | 361 | 306 | [844x390-13-crew-runner-page.png](844x390-13-crew-runner-page.png) |
| jobs | 69 | 0 | 64 | **321** (82%) | 1.8 | 1 small targets | 361 | 306 | [844x390-14-jobs.png](844x390-14-jobs.png) |
| jobs / Heists | 69 | 0 | 64 | **321** (82%) | 1 | - | 361 | 306 | [844x390-15-jobs-heists.png](844x390-15-jobs-heists.png) |
| jobs / Side | 69 | 0 | 64 | **321** (82%) | 1.6 | 1 small targets | 361 | 306 | [844x390-16-jobs-side.png](844x390-16-jobs-side.png) |
| jobs / Clients | 69 | 0 | 64 | **321** (82%) | 1.9 | 1 small targets | 361 | 306 | [844x390-17-jobs-clients.png](844x390-17-jobs-clients.png) |
| settings | 69 | 0 | 64 | **321** (82%) | 2.2 | - | 361 | 306 | [844x390-19-settings.png](844x390-19-settings.png) |
