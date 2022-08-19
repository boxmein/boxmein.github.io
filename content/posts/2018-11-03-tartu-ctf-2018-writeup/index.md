---
title: "Tartu CTF 2018 - Writeup"
date: "2018-11-03"
---

_I participated in a cybersecurity contest called a CTF (for capture the flag). It's a format of a security game where contestants have to attack a web or other type of server, and to prove their progress in breaking the server, they submit text strings called "flags" found at various steps of progress._

In the Tartu CTF 2018, we were playing the **[Game of Thrones CTF](https://github.com/OscarAkaElvis/game-of-thrones-hacking-ctf)**. At the start of the contest, we were given an IP address and nothing else. Time to get started.

The first thing we did was do a port scan to figure out the services the CTF server was hosting.

Here's the results:

johannesk@nyx TartuCTF % nmap -sV 192.168.1.205 -p 21,22,80,53
Starting Nmap 7.12 ( https://nmap.org ) at 2018-11-03 12:35 EET
Nmap scan report for 7kingdoms.lan (192.168.1.205)
Host is up (0.0047s latency).
PORT STATE SERVICE VERSION
21/tcp open ftp Pure-FTPd
22/tcp open ssh Linksys WRT45G modified dropbear sshd (protocol 2.0)
53/tcp open domain ISC BIND Bind
80/tcp open http Apache httpd
Service Info: Device: router

We could see from here that we've got a web server. Visiting it showed me a nice page with a Game of Thrones themed image on it.

Viewing the source code, however, reveals an HTML comment with more detailed info.

- There's 11 flags
- 7 of the flags have to be solved in order
- One of the flags is the "final battle flag"
- The remaining 3 are unrelated to the order they're solved in
- There's a battle map to be obtained to help me navigate this challenge machine

Next up, we checked robots.txt. That's a common place where CTF creators hide paths. We discovered three paths:

- /secret-island/. That's our battle map.
- /the-tree/. Some sort of hint to be checked out later.
- /direct-access-to-kings-landing/. Some sort of hint to be checked out later.

# Challenge 1: Dorne (FTP)

Checking out the battle map, and picking up a hint from the index page, reveals to us that "Dorne" is the name of the FTP challenge.

To solve Dorne, the other paths might be of use. Turns out /the-tree/ hides a hint in a sentence about using a different User-Agent to access the page, and something about a three eyed raven.

curl -H "User-Agent: Three-eyed-raven" http://192.168.1.205/the-tree/

This user agent reveals to us a different page with a comment in the source code, revealing to me the Dorne username: "oberynmartell".

To find the password, after a lot of struggles, we discovered the path /h/i/d/d/e/n/ that gave us the Dorne password.

We grabbed the Dorne flag from the FTP server's text banner and pulled the two files the FTP server was serving.

# Challenge 2: Winterfell (HTTP)

The first file was a file referencing "mcrypt" and the second was a plain text file called problems\_in\_the\_north.txt describing a hashing algorithm and containing a hash. Probably, the file's encryption key was revealed by reversing the hash.

We reversed the hash using john and decrypted the file.

root@kali:~# cat hashes.txt
nobody:6000e084bf18c302eae4559d48cb520c$2hY68a
root@kali:~# john --format=dynamic\_2008 hashes.txt
Using default input encoding: UTF-8
Loaded 1 password hash (dynamic\_2008 \[md5(md5($s).$p) (PW > 23 bytes) 128/128 AVX 4x3\])
Press 'q' or Ctrl-C to abort, almost any other key for status
stark            (nobody)
1g 0:00:00:00 DONE 3/3 (2018-11-03 13:54) 3.448g/s 571989p/s 571989c/s 571989C/s 142400..murum
Use the "--show" option to display all of the cracked passwords reliably
Session completed

Using the username nobody and the password stark on the encrypted file reveals the file contents to us.

The file contents revealed to us a domain name to visit (not a real one) - so we tried to visit the web server's IP using the same path. We were greeted by a web page that told us to sod off, since Apache was not matching the right Vhost.

We added an /etc/hosts entry to the site, and tried again. That worked. After logging in with HTTP basic auth, we got the HTTP challenge's flag.

And it worked! We got the flag and a cute page with a Stark emblem image.
