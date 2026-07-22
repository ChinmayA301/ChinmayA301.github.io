#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "json"
require "liquid"
require "time"
require "yaml"

module JekyllLikeFilters
  def absolute_url(input)
    value = input.to_s
    return value if value.match?(%r{\Ahttps?://})

    site_url = @context.registers.fetch(:site).fetch("url")
    "#{site_url.sub(%r{/$}, "")}/#{value.sub(%r{\A/}, "")}"
  end

  def relative_url(input)
    input.to_s
  end

  def date_to_xmlschema(input)
    input.respond_to?(:iso8601) ? input.iso8601 : Time.parse(input.to_s).iso8601
  end

  def jsonify(input)
    JSON.generate(input)
  end

  def number_of_words(input)
    input.to_s.scan(/\S+/).length
  end
end

Liquid::Template.register_filter(JekyllLikeFilters)

def front_matter(path)
  raw = File.read(path)
  match = raw.match(/\A---\s*\n(.*?)\n---\s*\n(.*)\z/m)
  raise "Missing front matter: #{path}" unless match

  data = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
  data["content"] = match[2]
  data["date"] ||= Date.parse(File.basename(path)[0, 10])
  data["url"] ||= "/blog/#{File.basename(path, ".md").sub(/^\d{4}-\d{2}-\d{2}-/, "")}/"
  data["layout"] ||= "post"
  data
end

def render_include(name, assigns, site)
  source = File.read(File.join("_includes", name))
  source = source.gsub(/\{%\s*include\s+schema-article\.html.*?%\}/, "") if name == "seo-head.html"
  template = Liquid::Template.parse(source)
  template.render!(assigns, registers: { site: site }, strict_filters: true)
end

def assert(condition, message)
  raise message unless condition
end

site = {
  "url" => "https://app.chinmayarora.com",
  "title" => "Chinmay Arora",
  "lang" => "en_US",
  "description" => "AI engineering and data science portfolio",
  "default_og_image" => "/assets/images/default-og.png"
}

posts = Dir["_posts/*.md"].sort.map { |path| front_matter(path) }
site["posts"] = posts.reverse

posts.each do |page|
  html = render_include("seo-head.html", { "page" => page, "site" => site }, site)
  description = page["description"] || page["summary"] || site["description"]
  image_path = page["image"] || page["og_image"] || site["default_og_image"]
  include_values = {
    "description" => description,
    "image" => "#{site['url']}#{image_path}",
    "canonical" => page["canonical_url"] || "#{site['url']}#{page['url']}",
    "modified" => page["last_modified_at"] || page["date"]
  }
  html += render_include(
    "schema-article.html",
    { "page" => page, "site" => site, "include" => include_values },
    site
  )
  assert(html.scan(/<link rel="canonical"/).length == 1, "canonical count failed: #{page['title']}")
  assert(html.scan(/<meta name="description"/).length == 1, "description count failed: #{page['title']}")
  assert(html.scan(/<meta property="og:image"/).length == 1, "og:image count failed: #{page['title']}")
  scripts = html.scan(%r{<script type="application/ld\+json">\s*(.*?)\s*</script>}m).flatten
  assert(scripts.length == 1, "Article schema count failed: #{page['title']}")
  JSON.parse(scripts.first)
end

blog_page = {
  "layout" => "blog",
  "title" => "Brain Vomit",
  "description" => "Technical notes from Chinmay Arora.",
  "url" => "/blog/"
}
blog_head = render_include("seo-head.html", { "page" => blog_page, "site" => site }, site)
assert(!blog_head.include?("application/ld+json"), "Blog head emitted Article schema")

posts.each do |page|
  related = render_include("related-posts.html", { "page" => page, "site" => site }, site)
  assert(related.include?("automatic-related-posts"), "Related posts section did not render: #{page['title']}")
  assert(related.scan(/<li>/).length == 3, "Related posts did not render exactly three links: #{page['title']}")
end

homepage = File.read("index.html")
assert(homepage.scan(/<meta name="description"/).length == 1, "Homepage description count failed")
assert(homepage.scan(/<link rel="canonical"/).length == 1, "Homepage canonical count failed")

puts "Validated homepage metadata, blog metadata, #{posts.length} article schemas, and related posts."
