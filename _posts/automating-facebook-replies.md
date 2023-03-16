---
title: 'Automating birthday replies with puppeteer'
date:   "2017-08-27 10:00:00"
---


Earlier this week, Chrome team released <a href="https://github.com/GoogleChrome/puppeteer/" rel="noopener">Puppeteer</a> - an API built on top of this year's previous release of <a href="https://developers.google.com/web/updates/2017/04/headless-chrome" rel="noopener">Chrome headless</a>. Puppeteer allows us to control the Chrome headless browser through a JavaScript API. I wanted to see what it can do, so I tried automating replies to people wishing me happy birthday this week - there was about 100 wishes, but I wanted a script I can quickly re-use each year that would save me some time.

The goal was to write a script that successfully recognizes a birthday wish, likes the post and replies with __"Thank you ${person.name}!"__.

Fairly straight forward I thought, shouldn't be __that__ hard, but there were some challenges.

### Starting the browser

<pre>
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
</pre>

The API is very straight forward, launch puppeteer and open a new page. Puppeteer works with a notion of <a href="https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-frame" rel="noopener">frames.</a>, where each frame exposes the current frame tree with it's children, so that we can work with different pages.


### Logging into facebook

Since I use a 2FA for my facebook account, I disabled that for the sake of easier login.

After this, the logic was:
<ol>
  <li>Get login and password DOM node references</li>
  <li>Fill in the form</li>
  <li>Submit and hope it works</li>
</ol>

The following code did the job:

<pre>
  async function login() {
    // Focus input
    await page.focus('#email');
    await page.type('MY_EMAIL');
    // Focus password
    await page.focus('#pass');
    await page.type('MY_PASS');
    // Get login button and submit it
    const loginButton = await page.$('#loginbutton input');
    await loginButton.click();
    // Wait if we get redirected to login
    await page.waitForNavigation()
  }
</pre>

<img src="/images/birthday-login.png" alt="Successfull login to facebook" class="image-wide">

During the development I would help myself with screenshots to see where the script would get stuck and debug it. We can see here that login worked and we were successfully redirected to our profile page.

### Gathering greetings and hitting the first obstacle

Facebook has a page where they list all the activity for your account. You can find it under your activity tab and it should look something like this:

<img class="image-wide" src="/images/birthday-activity.png" alt="Facebook profile activity">

From this we have a list of "recent" activity, but that could be anything and to get more activity, you have to either scroll to the bottom of the page or click the "show" more button.

Since I knew there were about 100 greetings and there are usually 20-30 listed per scroll/click I created a loop that clicks the button every 2 seconds for 5 times. We need the incremental timeout due to unreliable load time and the fact that during loading of activity the show more button is removed from the DOM and our script would throw.

From here it was very smooth sailing, but I hit the first obstacle of Puppeteer -> working with the DOM.

Puppeteer exposes a `page.$(selector)` and `page.$$(selector)` API which are equivalent to document.querySelector and document.querySelectorAll, but the difference is that the return value is not the DOM element reference, but an ElementHandle.

This is a bit tricky, because we can't do querySelector on ElementHandle, meaning we can't do
<pre>
  const element = await page.$('.component')
  const elementChild = await element.$('.componentChild')
</pre>

Instead, ElementHandle exposes an Evaluate function which will be evaluated in browser context meaning that to access the component children we need to

<pre>
  const element = await page.$('.component')
  const text = await element.evaluate(element => {
    const text = element.querySelector('.elementChild').textContent
    const postLink = element.querySelector('.postlink').href
    return {text, postLink}
  })
</pre>

After we have the entries, we need to filter them to only those people who wrote on our profile. We can do this like so:
<pre>
  greetings.filter(g => g.text.indexOf('wrote on your Timeline') > 0)
</pre>

### Opening each greeting, liking it and submitting our reply

We now have a list of all the greetings and links, time to be nice and show some love back.

<pre>
  async function handleBirthday(greeting => {
    // Open new page
    const page = await browser.newPage();
    // Go to post link
    await page.goto(greeting.postLink);
    // Get node reference
    const likedButton = await page.$('.UFILikeLink')
    // Check if we already liked the post
    let iLikedThePost = await likedButton.evaluate((e) => {
      return e.getAttribute('aria-pressed')
    })

    if(iLikedThePost === "false") {
      // \o/ Thank you for the greeting
      await likedButton.click()

      // sendReply()
      // I couldn't manage to this working, see below why

    }
  })
</pre>

As you can see, I failed to submit an actualy reply to the birthday greeting, there are a few things that caused issues.

1. I couldn't focus on the input, to make it active and able to input text, it seems that Facebook does some obfuscating. I have tried hovering the element for a small timeout, then clicking with the elementHandle.click to simulate a real world click but neither seemed to work (I tried a lot of elements).

2. The DOM inside the component is not easy to work with and Facebook probably makes it hard on purpose to avoid people like me.

<img src="/images/birthday-react-dom.png" alt="DOM of comment component" class="image-wide">

3. Pressure from the relatives who were arriving to my party while I had prepared nothing except my auto-liking script. /o\

### Running the script

<img src="/images/birthday-likes.png" alt="Auto-liking my posts" class="image-wide">

Due to the time pressure and first time using puppeteer the code obviously has flaws and is very primitive. It could be re-written, but I didn't really focus on that, I wanted to have it working and it sort of does the job(done is better than perfect right :P)

The liking part worked flawlessly, but I'm sad I couldn't create a reply, that will definitely stay in the back as something to improve for next year.

If anyone is interested in making contributions, feel free to do so, I would be happy to accept any!

At this point I want to thank everyone for the kind birthday wishes, I'm really happy to know every one of you ❤!

