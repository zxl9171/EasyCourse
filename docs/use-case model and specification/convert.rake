task :default
css_path = 'Clearness.css'
html_dir_path = "html"

FileList['*.md'].each do |t|
  filename = t.split('.').first
  sh "pandoc -s -S -c \"#{css_path}\" #{t} -o #{html_dir_path}/#{filename}.html"
end
