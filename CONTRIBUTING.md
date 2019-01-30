# How to contribute to Unlock

[Unlock](https://unlock-protocol.com) thrives on your contributions. We're excited you are here! Whether you are a software developer,
a designer, a writer, or a tester you are welcome. If you'd like to contribute but you're unsure where to start, you can always reach
out to us at [hello@unlock-protocol.com](mailto:hello@unlock-protocol.com). We'd love to help.

Unlock is a community where everyone can contribute. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) for guidelines of how we
create a space that makes this possible.

## Where to begin

Unlock uses an [issue tracker](https://github.com/unlock-protocol/unlock/issues) to manage our backlog of both new ideas and problems
that need to be fixed. We use comprehensive code review to ensure that every new idea is thoroughly vetted prior to being integrated
into the codebase. Please [check for existing issues](https://github.com/unlock-protocol/unlock/issues) to see what we are doing now.
We have some issues that have been marked as a great way to begin:

* [A list of good first issues](https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) for contributors looking for somewhere to get started

As well as issues that are harder challenges that we need help with:

* [Requests for help wanted](https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)

If you've found a problem, or would like to see what existing ones need fixing, you can check the complete list of bugs:

* [Bugs that need to be fixed](https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3Abug)

## Reporting problems and suggesting changes

If you wish to contribute by pointing out a problem or suggesting a change, then we have some simple guidelines to help you get
started with this, read on to learn our workflow.

### If you have found a problem

To help us fix problems and work together efficiently, we ask that you take a few steps before reporting a new issue

1. [Search the issue tracker](https://github.com/unlock-protocol/unlock/issues) to see if someone else has already submitted
   this issue.
2. Give as much information as possible about your environment. What kind of device/browser are you using? what steps can we take to
   reproduce the bug?
3. If possible, [take a screenshot](https://www.google.com/search?q=taking+a+screenshot&rlz=1C5CHFA_enUS828US828&oq=taking+a+screenshot&aqs=chrome..69i57j0l5.7157j0j4&sourceid=chrome&ie=UTF-8) and attach it to the issue.

If you're sure you have found a new, unreported problem, please follow the template in the bug report, this will help us isolate
and fix the issue you've found as fast as possible!

### If you have an idea for a new feature

Have you got a killer idea for the Unlock Protocol? We are excited you are dreaming along with us! To help us evaluate your idea,
please take these steps before submitting a feature request:

1. [Search the issue tracker](https://github.com/unlock-protocol/unlock/issues) to see if someone else has already submitted
   this idea or something similar.
2. Ask yourself what information would be needed to best implement this idea? Is it specific enough to be possible? If you are not
   sure, perhaps you could write us at [hello@unlock-protocol.com](mailto:hello@unlock-protocol.com) or join us on our
   [Telegram](https://t.me/unlockprotocol) first to discuss the idea?

If you have followed these steps, and you're ready to begin, open a feature request issue. Please follow the template,
we have designed it to help you clarify your idea.

## Advanced contributions

If you are ready to go a step further, and contribute changes to the codebase, then we ask for more rigorous standards.

To contribute a design idea, copy-editing, or other contributions not directly related to the functioning code, please
open an issue as described above containing your contribution.

If you want to contribute code, then please read the steps below on how to create a local branch on your fork, and create a
pull request from that branch.

### Contributing code: Addressing an existing issue

First off, thank you! We recognize the effort it takes to contribute code, and value both your code and your time.

When you are ready to contribute code, please ensure that it is a direct implementation of a solution to a problem
mentioned in an [existing issue on our issue tracker](https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3Abug). If you wish to tackle an issue, please ask by commenting on the issue, we will get back to you very quickly.

When you are ready to contribute to the codebase, then you will need to create a [pull request](https://help.github.com/articles/about-pull-requests/) from a local [fork](https://help.github.com/articles/fork-a-repo/)
of the [Unlock Protocol git repository](https://github.com/unlock-protocol/unlock). We strongly recommend that you
do all development on a [branch](https://help.github.com/articles/about-branches/) named with this convention:
`yourname-short-title`. where `yourname` is your github username.

When you have finished initial development, you're ready to submit a pull request. Please check these important aspects of your code:

1. Your code addresses a [specific issue that is open to being fixed](https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3Abug).
2. Your code is well-documented.
3. Your classes, functions, interfaces, etc are all clearly named
4. Your style and naming conventions adhere to the style used in the rest of the codebase
5. If your contribution adds new code, you have written tests in the `/unlock-app/src/__tests__` or `smart-contracts/test` folders that
   verifies the correctness of your code.
6. when you run `npm run test` all tests pass. Our pre-acceptance tests will not allow us to merge a pull request with failing tests
7. likewise, be sure `npm run lint` has no errors, as these will also block merging of a pull request.

When these conditions are satisfied, [submit a pull request](https://github.com/unlock-protocol/unlock/compare), with the
following rules:

1. Only include files that are directly related to the pull request and the issue it solves, so no personal
   configuration files, `node_modules` and so on.
2. Title: include a brief description of the contribution. Do not mention issue numbers.
3. Description: include relevant issue numbers in the description (as in `fixes #1234: something went wrong`)
4. Description: include a concise, specific description of the complete pull request in the description
5. Description: include screenshots/screencasts if you have added any visual changes

You may be asked to revise your code or other aspects of your pull request. This is an important part of the collaboration
and one we take very seriously. Any feedback your code receives is directed towards helping your code fit seamlessly into
the existing codebase, and not directed at you personally. We are excited for your contributions, please take our interactions
with you as a reflection of this goal!
