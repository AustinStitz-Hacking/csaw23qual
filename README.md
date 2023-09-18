# CSAW '23 Qualifiers Writeups

I am really glad to have had the opportunity to participate in the CSAW CTF competition for 2023 as a part of the [49th Security Division](https://49sd.com/) from September 15th to 17th, 2023!

Our team earned 2834 points, placing us at 103rd place out of the nearly 1,500 teams that competed.

![CSAW results](images/49sdresultscsaw23.png)

I completed 6 challenges, earning 1608 points for my team, although I may or may not have ended up getting no sleep at all this weekend in the process...

And here are some writeups for the challenges I completed in this competition!

The points for the challenges were not predetermined, but determined by the number of people who solved them. The maximum points for a challenge was 500, but this decreased as more people solved the challenges.

Overall, I had a lot of fun with this competition and definitely can't wait to hopefully participate next year too!


# Web: Philanthropy

**Points:** 186

**Author:** Enigma

**Description:** Can you break into the Philanthropy website and get more information on Snake and Otacon?

**Links:** [http://web.csaw.io:14180/web/home](http://web.csaw.io:14180/web/home)

## Writeup

As always with any web challenge, the first step is recon!

The challenge description gives us our targets: two users known as Snake and Otacon. Well, right on the about page is information on Otacon's email!

![Philanthropy Image 1](images/philanthropy1.png)

Anyways, there isn't much else that we can see before logging in, so we can register a new fake user and log in!

![Philanthropy Image 2](images/philanthropy2.png)

Now that we're logged in, we can see a bit more, including a tab for "Profile" and a tab for "Membership". The latter hints at access control which may help us get the information we need to get the flag!

Looking at the Membership tab, we see a prompt for a code. We don't have a code right now, but this does verify that there is a way to get a membership for the website and access more information!

![Philanthropy Image 3](images/philanthropy3.png)

This membership must be stored somewhere to be used, and it might also be included in web requests! In particular, using the DevTools Network tab, we can see an endpoint, `/identity/verify`, which includes this information.

![Philanthropy Image 4](images/philanthropy4.png)

Since the `Member` attribute is false, we may be able to modify this information!

Once we look at the Profile tab, we can see that we do have the ability to modify our user's information, including the display name. And when we modify it, we can see a request to `/identity/update` that we can capture!

![Philanthropy Image 5](images/philanthropy5.png)

We can use JavaScript to send this request with `fetch`!

```js
fetch("http://web.csaw.io:14180/identity/update", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json"
  },
  "referrer": "http://web.csaw.io:14180/web/profile",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"username\":\"test@uncc.edu\",\"first_name\":\"TestUser\",\"last_name\":\"TestTest\", \"member\":true}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
```

This is pretty easy to do since we can just copy the result as fetch and add `\"member\":true` to make ourselves a member.

This update doesn't show immediately, but if we clear cookies and refresh, we can see that we are now a member and have access to even more, including a flag page!

![Philanthropy Image 6](images/philanthropy6.png)

However, we cannot see the flag at this page and need to do a bit more digging! We do have access to another page, Identify, though! The page includes a mini quiz game to identify pictures of "Metal Gear" robots. When these images are loaded, we can see that the request is directly tied to Otacon's email!

![Philanthropy Image 7](images/philanthropy7.png)

We can also see credit to `solidsnake@protonmail.com`, which seems to be our other target, so let's check that by modifying the URL and opening in a new tab!

![Philanthropy Image 8](images/philanthropy8.png)

And opening the image specified, we get a password!

![Philanthropy Image 9](images/philanthropy9.png)

And logging in, we can access the flag!

![Philanthropy Image 10](images/philanthropy10.png)

And our flag is `csawctf{K3pt_y0u_Wa1t1ng_HUh}`!


# Forensics: 1black0white

**Points:** 50

**Author:** robert-todora

**Description:** We received this file of seemingly random numbers, but the person that sent it is adamant that it is a QR code. Can you figure it out for us?

**Files:** [qr_code.txt](files/1black0white/qr_code[1].txt)

## Writeup



# Intro: whataxor

**Points:** 75

**Author:** ElykDeer

**Description:** Now you actually need to figure what the binary is doing.......maybe try a tool like https://dogbolt.org/; It shows you the output of several tools that try to extract a representation similar to what the original code might have looked like.....which is a lot nicer than reading bytes.

**Files:** [readme.txt](files/whataxor/readme[1].txt), [whataxor](files/whataxor/whataxor[1])

## Writeup



# Crypto: Mental Poker

**Points:** 488

**Author:** Dhyey Shah (CTFd)

**Description:** Let's play some mental poker.

`nc crypto.csaw.io 5001`

**Files:** [server.py](files/poker/server[1].py)

## Writeup



# Incident Response: What is going on?

**Points:** 382

**Description:** The HudsonHustle company has contacted you as they are not able to figure out why they can not access any of their files. Can you figure out what is going on?

**Files:** network.pcap, server2019.vmdk, win10.vmdk (downloaded from zip file in first IR challenge)

## Writeup



# Incident Response: Initial Access

**Points:** 427

**Description:** How were they hacked?!?!

`nc misc.csaw.io 5001`

## Writeup


