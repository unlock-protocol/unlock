---
title: The End of the Ad-Supported Web
subTitle: What if we got the business model of the web wrong?
authorName: Julien Genestoux
publishDate: December 13, 2018
description: What if we got the business model of the web wrong?
image: /images/blog/adsupportedweb/1984.jpg
---
For the last 20 years, every consumer-oriented application, service or content platform used “ads” as its default business model. Like always, the road to hell has been paved with good intentions: we assumed that the mostly innocuous billboards could be transposed to the web… but these banner ads quickly became endless trojan horses into our privacy, feelings and opinions.

Our naive “content-wants-to-be-free” approach failed to account for externalities, including the fact that hostile organizations are influencing us through our media consumption… Using ads to support content creation is not working anymore, whether it is from a purely technical aspect when more and more of the provisioned ads are not being displayed, from an economic standpoint where, outside of a shrinking number of larges platforms, nobody is able to even scrape cents per hour spent staring at ads.

## Technical challenges

Delivering relevant ads has always been the main challenge for ad platforms. As we reaching unparalleled capabilities when it comes to picking the right ad for each user, new technical problems are making even displaying the ads much harder.

Ad blockers have been around for a little while, but there is no denying that their impact has been growing vastly in the last couple years. If anything, the constant alerts to disable ad blockers demonstrates that they are having a real impact.

![ad blocker](/images/blog/adsupportedweb/adblocker.png)
_About 30% of web users in the US browse with an ad-blocker._

On top of the “individual” use of ad-blockers, we’re starting to see institutions enter the arena. The most notorious example is Apple who has started to tighten the use of 3rd party cookies in Safari, as well as opened the gate to ad blocker on their AppStore.

Of course, Apple’s effort can easily be dismissed when confronted with the fact that Apple apparently [sells $12Bn worth of “search users” to Google every year](http://fortune.com/2018/09/29/google-apple-safari-search-engine/). The hypocrisy is of course not limited to Apple, since several ad blockers have been caught [selling user data](https://www.wired.com/2016/03/heres-how-that-adblocker-youre-using-makes-money/), or even **showing their own ads** instead of the ones “picked” by the publishers.

On that same front, a couple years ago, the innovative French ISP, Free, decided to [block ads by _default_](https://www.fastcompany.com/3004452/french-isp-free-blocks-all-web-advertising) on its latest modem: this move too was motivated by more than just a sudden care of user’s privacy, but it shows how blocking ads is technically easy to implement at large scales.

The numbers are clear: ad blockers are growing in popularity and they’re also followed by the increasing use of VPN and other privacy-enforcing techniques which are making ads less relevant and effective.

The ad industry has been one of the most creative when it came to tracking users. For example, did you know that by combining email tracking and banner retargeting, ad networks that you never heard of know your full identity (including your full name and personal information) all across of the web? But the rules of what is possible are now being superseded by the rule of law. Europe’s GDPR has been such as game changer that, 6 months in, several US media sites are still blocking traffic from Europe (and foregoing the corresponding ad revenues), because they understand that they are not compliant. And, as [Robin Berjon](https://twitter.com/robinberjon) puts it, there is still a very real chance that even the largest ad-tech companies might soon be exposed to massive legal action.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Recently, the <a href="https://twitter.com/CNIL?ref_src=twsrc%5Etfw">@CNIL</a> issued a decision regarding the GDPR compliance of an unknown French adtech company named &quot;Vectaury&quot;. It may seem like small fry, but the decision has potential wide-ranging impacts for Google, the IAB framework, and today&#39;s adtech. It&#39;s thread time! 👇</p>&mdash; Robin Berjon (@robinberjon) <a href="https://twitter.com/robinberjon/status/1063549722613432320?ref_src=twsrc%5Etfw">November 16, 2018</a></blockquote>

## Economic challenges

The technical challenges exposed above are adding friction for medium, small and indie creators. Smaller websites and applications do not have the resources to block the blockers or, more importantly to implement native forms of ads which cannot easily be blocked.

Many have exposed that both Apple’s ad blocking crusade and Europe’s GDPR are, in fact, [reinforcing the duopoly](https://www.telegraph.co.uk/technology/2018/10/10/google-increases-tracking-web-users-gdpr-privacy-law/). By increasing the cost of compliance, these efforts are excluding organizations who could not amortize them through massive scale. It shows that, once more, “protecting the consumer” is a great way to decrease competition by ejecting smaller players, and empower incumbents.

At this point, Google and Facebook already [capture more than 90% of the digital ad market growth](https://adexchanger.com/online-advertising/digital-ad-market-soars-to-88-billion-facebook-and-google-contribute-90-of-growth/). Amazon is obviously the elephant in the room here, but the data is clear: anyone else trying to monetize their content with ads will be fighting un uphill battle going forward. Even when they are large enough that they can have direct sales team, platforms like Twitter or Snapchat seem to be struggling to make ads work.

The most upsetting part of this new landscape is that the companies which control ad revenues are also the ones which control traffic distribution. Ad revenues are realized when ads are matched with visitors… but these days, both ads and visitors are actually coming from the same few giant tech companies: [Google and Facebook represent 75% of external referrers](https://www.parse.ly/resources/data-studies/referrer-dashboard/).

I will not go full MBA on you, but you don’t have to be [Michael Porter](https://en.wikipedia.org/wiki/Michael_Porter) to understand that if your suppliers and buyers are the very same people, your bargaining powers are, at best, limited.

> Clearly, given that [they know everything about us](https://www.businessinsider.com/how-to-find-out-everything-facebook-knows-about-you-2018-3) AND that we also give them [nearly one hour per day](https://www.nytimes.com/2016/05/06/business/facebook-bends-the-rules-of-audience-engagement-to-its-advantage.html), they must be killing it. Right?

But let’s go one step further and ignore externalities, one last time. Are ads even a good way to capture value? Well, they make $2 per user per month… anti-climactic! So much data, machine learning, and engineering work for a miserable yield. It turns out that people spend as much time on Netflix than on Facebook: [about 50 minutes](https://www.cnbc.com/2018/07/17/netflix-small-portion-of-overall-watch-time-and-competition-is-stiff.html), but Netflix makes $30 per quarter (5 times as much), with virtually no tracking beyond what movies a user has watched (they actually don’t even require your real name apparently, as long as you pay!).

So, even from a purely economic standpoint, ads are a terrible way to capture value, and of course harder and harder for smaller publishers and creators.

## Essential challenges

Now, as an engineer, I know that we could still find ways around the technical challenges:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Alt text = Facebook breaks the word &quot;Sponsored&quot; in 4 spans, and adds 4 visually hidden spans with the letter &quot;S&quot;, so that the textContent for this mess is &quot;SpSonSsoSredS&quot; <a href="https://t.co/iFMKbOedHT">https://t.co/iFMKbOedHT</a></p>&mdash; Florens Verschelde (@fvsch) <a href="https://twitter.com/fvsch/status/1071522348606595072?ref_src=twsrc%5Etfw">December 8, 2018</a></blockquote>

And, as an entrepreneur, I know that there are other ways to monetize creation, whether it is content or software that is not ad-based.

But, as a citizen, I start to question the very premise of what advertisement is all about: _someone else is paying for the stuff that I am consuming_. _**But why? And what does it eventually lead to?**_

The quick answer is that whoever pays for the stuff we consume has a message to communicate: some product we don’t know about is great, this service just got cheaper, that politician’s economic policies have been disastrous… Like everyone else, these ‘advertisers’ are looking for better returns on their investments and the data is clear: ads tend to work better when they are more (re)targeted. This obviously **leads to privacy invasion** and, eventually, surveillance. Are we really willing to let go of some of our most basic rights for our right to information and knowledge?

> We got duped: we were told we could get free knowledge for a little bit of our attention, but it turns out that despite all the privacy we increasingly give away, the content we get seems to decrease in value.

Advertisers rightfully want to drive down the unit costs of their ads: who would not try to achieve the same goals at a lower price? But doing so also means that, on the other end of that relationship, the incentive of the publisher becomes to increase the volume of ads they display. As such, in the ad-supported web, the incentive for the creator is to create more content, not better content. All of the metrics that we used, whether it is CPM, cost per click, or performance/conversion eventually all boil down to “how much attention can this content take from consumers”. This started with the “information overload” complaints from 20 years ago and continued with the incessant slideshows, notifications, click bait and eventually fake news: everything that can steal a couple more minutes of the free web users’ time is financially rewarded: **the content itself becomes an excuse for the ads that surround it**.

![1984](/images/blog/adsupportedweb/1984.jpg)
_Image: 1984 by [Lesley Barnes](https://www.lesleybarnes.co.uk/1984-The-Graphic-Canon-3)_

What if we got all this wrong? What if instead of volume, we rewarded quality? What if creators were being paid based on the value they create for their consumers, rather than based on the attention they steal from them?

...

**Ads are not viable anymore for most web creation.** They are now becoming less delivered, less relevant, and even less profitable as well as increasingly more detrimental to the whole web ecosystem: when they were the “default” choice for any kind of online monetization, they are sometimes turning into a liability for the websites which display them.

It is time to remember that if content is free to consume, it must not be very expensive to produce… As a society, we should now understand that if you pay peanuts, you get _monkeys_. Building an ad-supported web was misguided and it is now slowly starting to collapse under its own absurdity. However, we should not rejoice until we have been able to ensure that creators are paid for their work: they alone are changing the status quo and moving our world forward.
