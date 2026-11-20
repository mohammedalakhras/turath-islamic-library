---
layout: default
title: "الرئيسية"
description: "تصفّح وحمّل الكتب التراثية والأثرية كاملة ومجاناً، بنصوصها الأصلية دون تحريف."
---
{%- assign categories = site.data.books | map: "category" | uniq -%}

<div class="container reading-column" style="max-width:1100px;">
  <h1 class="page-title book-title">مكتبة التراث</h1>
  <p class="meta-line">
    أرشيف حرّ للكتب الأثرية والتراثية، منشورة بنصوصها الكاملة كما وردت في مصادرها، مع فهارس تفاعلية لكل كتاب وفصل.
  </p>

  <div class="filters" role="group" aria-label="تصفية حسب التصنيف">
    <button type="button" class="active" data-filter="all">الكل</button>
    {% for cat in categories %}
    <button type="button" data-filter="{{ cat }}">{{ cat }}</button>
    {% endfor %}
  </div>

  <div class="book-grid">
    {% for book in site.data.books %}
    {% if book.published %}
    <a class="book-card" data-category="{{ book.category }}" href="{{ "/books/" | append: book.slug | append: "/" | relative_url }}">
      <div class="cover">
        {% if book.cover %}<img src="{{ book.cover | relative_url }}" alt="غلاف كتاب {{ book.title }}">{% else %}📖{% endif %}
      </div>
      <div class="info">
        <p class="cat">{{ book.category }}</p>
        <h3>{{ book.title }}</h3>
        <p class="author">{{ book.author }}</p>
        <span class="continue">{{ book.chapters_count }} فصلاً</span>
      </div>
    </a>
    {% endif %}
    {% endfor %}
  </div>
</div>
