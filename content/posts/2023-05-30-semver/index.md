---
title: "How semver makes sense in my head"
date: "2023-05-30"
---

Current descriptions of semver, e.g. in https://semver.org, focus heavily on the change that you made rather
than what you're communicating to your library consumers. I think that needs to change.

## How I explain semver

I've explained semver within my team in a different way:

* **MAJOR** versions mean that you have to do extra work to update to the latest version
* **MINOR** versions mean that you have to do extra work to downgrade from the latest version
* **PATCH** versions mean you don't have to do extra work to upgrade or downgrade.

In my experience, using this classification *means* the same thing as original semver, but it is much clearer
as a library author to classify my changes according to what my users need to do, rather than the more opaque
terms of incompatible API change or backward compatible fixes.

## What this means

Let's say we're working on a library. I'm making a pull request and trying to understand if I should bump the
major, minor or patch version. I would go through the changes I've made, and think about this:

**Do my users need to do extra work to upgrade?**

This extra work could be anything:

* bump the version of a peer dependency
* enable some strict or less-strict options
* rename references to a function
* do some extra steps before the library works again (e.g. initializing some objects)

If I made a change that makes my users do extra work just to upgrade, I have to bump the major version.

### Major versions

Major releases encompass API changes, Angular version updates, build output changes, ESM support, and more.

### Minor versions

This is where most feature releases would go to.

It's really easy to accidentally cause breaking changes when developing for a minor version, so additional
scrutiny is required here. Even if in practice, most users of your API will not downgrade the version, it is 
polite to keep an eye if your minor version actually is a minor change. Because Dependabot might upgrade
your published library, thinking all is fine, and its PR will be stuck cluttering the pull-request list for
a long time.

