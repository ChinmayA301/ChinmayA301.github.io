# frozen_string_literal: true

require "uri"

module BrainVomit
  # Builds the blog as an independent root-level publication while leaving the
  # portfolio's existing /blog/... build unchanged.
  class DomainGenerator < Jekyll::Generator
    priority :highest

    def generate(site)
      return unless site.config["brainvomit_mode"]

      site.posts.docs.each do |post|
        legacy_url = legacy_post_url(post)
        new_url = legacy_url.sub(%r{\A/blog(?=/|\z)}, "")
        new_url = "/#{post.data.fetch('slug')}/" if new_url.empty? || new_url == "/"

        post.data["legacy_url"] = legacy_url
        post.data["permalink"] = new_url
        post.data["canonical_url"] = absolute(site, new_url)
        reset_url(post)
      end

      site.pages.each do |page|
        case page.path
        when "blog/index.html"
          rewrite_page(site, page, "/", "/blog/")
        when "blog/privacy.md"
          rewrite_page(site, page, "/privacy/", "/blog/privacy/")
        end
      end
    end

    private

    def legacy_post_url(post)
      explicit = post.data["permalink"].to_s
      return normalize(explicit) if explicit.start_with?("/blog/")

      canonical = post.data["canonical_url"].to_s
      unless canonical.empty?
        path = URI.parse(canonical).path
        return normalize(path) if path.start_with?("/blog/")
      end

      normalize("/blog/#{post.data.fetch('slug')}/")
    rescue URI::InvalidURIError
      normalize("/blog/#{post.data.fetch('slug')}/")
    end

    def rewrite_page(site, page, new_url, legacy_url)
      page.data["legacy_url"] = legacy_url
      page.data["permalink"] = new_url
      page.data["canonical_url"] = absolute(site, new_url)
      reset_url(page)
    end

    def absolute(site, path)
      "#{site.config.fetch('url').sub(%r{/\z}, '')}#{path}"
    end

    def normalize(path)
      normalized = path.start_with?("/") ? path : "/#{path}"
      normalized.end_with?("/") ? normalized : "#{normalized}/"
    end

    def reset_url(item)
      item.instance_variable_set(:@url, nil)
    end
  end
end

Jekyll::Hooks.register %i[pages documents], :post_render do |item|
  site = item.site
  next unless site.config["brainvomit_mode"] && item.output.is_a?(String)

  portfolio_url = site.config.fetch("portfolio_url", "https://app.chinmayarora.com").sub(%r{/\z}, "")
  output = item.output

  output.gsub!("https://app.chinmayarora.com/blog/", "https://brainvomit.blog/")
  output.gsub!(/(href|src|data-share-url)=(['"])\/blog\//, '\\1=\\2/')

  %w[projects intelligence experience coursework reports resumes ideas].each do |section|
    output.gsub!(/href=(['"])\/#{section}\//, "href=\\1#{portfolio_url}/#{section}/")
  end

  item.output = output
end
