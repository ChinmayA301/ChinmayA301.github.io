# frozen_string_literal: true
require "json"
require "fileutils"

# Emit public metadata only. The build script adds the rendered article text and
# hashes after Jekyll finishes; unpublished/future posts are absent from output.
Jekyll::Hooks.register :site, :post_write do |site|
  next unless site.config["brainvomit_mode"]

  posts = site.posts.docs.select { |post| File.file?(post.destination(site.dest)) }.map do |post|
    {
      "title" => post.data.fetch("title").to_s,
      "url" => "#{site.config.fetch('url').sub(%r{/$}, '')}#{post.url}",
      "summary" => (post.data["description"] || post.data["summary"] || "").to_s,
      "tags" => Array(post.data["tags"]).map(&:to_s),
      "published_at" => post.date.utc.iso8601,
      "content_type" => (post.data["content_type"] || "essay").to_s,
      "source_path" => post.relative_path.sub(%r{^/}, ""),
      "output_path" => post.destination(site.dest).delete_prefix("#{site.dest}/")
    }
  end
  File.write(File.join(site.dest, ".contentos-posts.json"), JSON.generate(posts))
end
