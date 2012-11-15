#encoding: utf-8
require 'mustache'
require 'json'
require 'active_support/core_ext/hash'

class Renderer
    attr_accessor :template, :hash
    def initialize(template, hash)
        @template = template
        @hash = hash.symbolize_keys
    end

    # initialization helper
    def self.load_template(template_path, hash)
        begin
            template = nil
            File.open(template_path, 'r:UTF-8') do |file|
                template = file.read
            end
            return self.new(template, hash)
        rescue => ex
            puts ex
        end
    end

    def to_s
        Mustache.render(self.template, self.hash)
    end
end

class MDParser
    attr_reader :meta, :content
    def initialize(content_path, frontpage_path = nil)
        begin
            File.open(content_path, 'r:UTF-8') do |file|
                @raw_content = file.read.split('<!-- MetaEnd -->')
            end
        rescue => ex
        end
        @frontpage_path = frontpage_path
    end

    def meta
        json_string = @raw_content.first.chomp
        @meta ||= JSON.parse(json_string).symbolize_keys
    end

    def content
        @content ||= @raw_content.last
    end
end

o = MDParser.new('test.md')
r = Renderer.load_template('frontpage.html', o.meta)

puts r.to_s