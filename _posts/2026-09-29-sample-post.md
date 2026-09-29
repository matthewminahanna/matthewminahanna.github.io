---
title: "Sample post: how math looks here"
lede: A formatting check for math posts. Delete this file (or overwrite it) once you've written a real one.
tags: [meta]
---

This is a sample post so you can see how writing renders. Posts live in `_posts/` and are named `YYYY-MM-DD-short-title.md`. Write inline math with double dollar signs, like $$e^{i\pi} + 1 = 0$$, right inside a sentence.

Put display math on its own line, with a blank line above and below:

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}.
$$

## Theorems and proofs

Wrap a block in a `div` with a class of `theorem`, `lemma`, `definition`, `remark`, or `proof`, and add `markdown="1"` so Markdown still works inside it:

<div class="theorem" markdown="1">
**Theorem (Euclid).** There are infinitely many primes.
</div>

<div class="proof" markdown="1">
Suppose $$p_1, \dots, p_k$$ were all of the primes, and let $$N = p_1 p_2 \cdots p_k + 1$$. Then $$N > 1$$, so some prime $$p$$ divides $$N$$. That prime is one of the $$p_i$$, so it also divides $$N - p_1 \cdots p_k = 1$$, which is impossible.
</div>

## Everything else

Regular Markdown works too: *italics*, **bold**, [links](https://en.wikipedia.org/wiki/Euclid%27s_theorem), lists, and footnotes.[^1]

1. Numbered lists
2. Look like this

> Block quotes look like this.

```python
def primes_up_to(n):
    sieve = [True] * (n + 1)
    for p in range(2, int(n ** 0.5) + 1):
        if sieve[p]:
            sieve[p * p :: p] = [False] * len(sieve[p * p :: p])
    return [p for p in range(2, n + 1) if sieve[p]]
```

[^1]: Footnotes end up at the bottom of the post.
