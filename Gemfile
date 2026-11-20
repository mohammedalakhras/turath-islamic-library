source "https://rubygems.org"

# هذا الـ gem يضمن أن إصدارات Jekyll والإضافات مطابقة تماماً
# لما يستخدمه GitHub Pages في الخوادم، لتفادي أي فروقات عند النشر
gem "github-pages", group: :jekyll_plugins

group :jekyll_plugins do
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-feed"
  gem "jekyll-paginate"
end

# لتشغيل الموقع محلياً على ويندوز/ماك عند الحاجة
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
