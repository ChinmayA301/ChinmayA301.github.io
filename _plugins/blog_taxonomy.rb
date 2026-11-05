# frozen_string_literal: true

# Keep the publication index honest. A post owns its topic in front matter;
# missing or unknown values fail the build instead of silently falling into an
# unrelated section.
Jekyll::Hooks.register :site, :post_read do |site|
  allowed_topics = Array(site.data.dig("blog_topics", "topics")).map { |topic| topic.fetch("id") }
  errors = site.posts.docs.flat_map do |post|
    post_errors = []
    topic = post.data["topic"].to_s
    unless allowed_topics.include?(topic)
      value = topic.empty? ? "missing" : topic.inspect
      post_errors << "#{post.relative_path}: topic is #{value}"
    end

    tags = Array(post.data["tags"]).map(&:to_s).reject(&:empty?)
    post_errors << "#{post.relative_path}: tags are missing" if tags.empty?
    post_errors
  end

  next if errors.empty?

  raise Jekyll::Errors::FatalException,
        "Invalid blog taxonomy:\n- #{errors.join("\n- ")}\nAllowed topics: #{allowed_topics.join(", ")}"
end
