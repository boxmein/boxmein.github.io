---
title: "Why your Estonian ID card won't register in OSX Keychain Access"
date: "2017-01-03"
---

If you're a developer and once tried to login via SSH to your virtual server, this might be why you can't sign in to online services anymore.

The symptoms aren't really obvious - you won't be able to sign in to banks or other services. Swedbank prompts you with a "Kasutaja tuvastamine ebaõnnestus" while eesti.ee will show a SSL\_CLIENT\_AUTH\_CERT\_NEEDED error. When you open Keychain Access, the card will not be listed on top on the left sidebar (above the login keychain). OpenSC tools will identify the card correctly

$ opensc-tool -n

After about an hour of google-fu, I discovered I had installed **opensc** and this caused Keychain Access to not see the ID card. However, signing/opening signed documents worked perfectly fine with DigiDoc. A simple (but annoying) fix is to remove opensc:

$ brew remove opensc

 After this, a reboot should take care of it.

Hope this saves you some time!
