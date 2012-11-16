#encoding: utf-8
require 'mustache'
require 'json'
require 'tempfile'
require 'pathname'
require 'active_support/core_ext/hash'
require 'cocaine'
require 'logger'

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
            puts ex
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

def same_dir_path(filename)
    File.expand_path(File.dirname(__FILE__), filename)
end

def corename(filepath)
    File.basename(filepath).split('.').first
end

def md2html(options)
    opts = {
        template: same_dir_path('default.html'),
        style: same_dir_path('clearness.css')
    }.merge(options)

    `pandoc --include-before=#{opts[:frontpage]} --toc --template=#{opts[:template]} -s -S -c #{opts[:style]} #{opts[:content]} -o #{opts[:output_file]}`
    
end

def html2pdf(params)
    params = {
        :'page-left' => '70',
        :'page-right' => '70',
        :'page-top' => '70',
        :'page-bottom' => '70'
    }.merge(params).symbolize_keys

    pattern = params.reject {|key| key == :in }.inject('') {|str, hash| str + "-o #{hash[0]}=:#{hash[0]} "}
    pattern << ':in > :out'

    line = Cocaine::CommandLine.new('cupsfilter', pattern, :swallow_stderr => true)
    line.run(params)
end


if ARGV.length <= 1 then
    puts 'USAGE: ruby Renderer input_file output_file template_file'
else
    input_file =ARGV[0]
    output_file = ARGV[1]
    frontpage_file = ARGV[2] || same_dir_path('frontpage.html')

    o = MDParser.new(input_file)
    r = Renderer.load_template(frontpage_file, o.meta)

    begin

        content_tmpfile = Tempfile.new(["content", '.md'])
        content_tmpfile.write(o.content)
        content_tmpfile.close

        frontpage_tmpfile = Tempfile.new(["frontpage", '.html'])
        frontpage_tmpfile.write(r.to_s)
        frontpage_tmpfile.close

        html_tmpfile = Tempfile.new(["intermedia", '.html'])
        html_tmpfile.close

        md2html({content: content_tmpfile.path, frontpage: frontpage_tmpfile.path, output_file: html_tmpfile.path})
        puts "md2html done!"

        html2pdf({:in => html_tmpfile.path, :out => output_file})
        puts "html2pdf done! Generated #{output_file}"
    rescue => ex
        puts ex
    ensure
        [content_tmpfile, frontpage_tmpfile, html_tmpfile].each(&:unlink)
    end
end