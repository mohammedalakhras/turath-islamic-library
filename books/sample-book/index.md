---
layout: book
permalink: /books/sample-book/
title: "اسم الكتاب التراثي"
book_slug: sample-book
book_title: "اسم الكتاب التراثي"
book_url: /books/sample-book/
book:
  author: "اسم المؤلف"
  era: "القرن الهجري / الفترة الزمنية"
  category: "عقيدة"
  pdf: /assets/pdf/sample-book.pdf
  summary: >-
    وصف مختصر وموضوعي عن الكتاب ومحتواه وأهميته التراثية، يكتبه فريق
    المكتبة، ولا يُعدّ جزءاً من نص الكتاب الأصلي.
---

تمهيد فريق المكتبة عن الكتاب يوضع هنا إن وُجد — وهو نص تحريري من فريق
الموقع وليس من نص الكتاب نفسه.

{% include diagram.html label="مخطط هيكل الكتاب العام" code="
graph RL
  A[اسم الكتاب] --> B[الفصل الأول: عنوانه]
  A --> C[الفصل الثاني: عنوانه]
  B --> B1[الفقرة ١]
  B --> B2[الفقرة ٢]
  C --> C1[الفقرة ١]
  C --> C2[الفقرة ٢]
" %}
