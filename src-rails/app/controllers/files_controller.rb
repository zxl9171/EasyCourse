class FilesController < ApplicationController
  def index
    file = {
      title: "Snip20121203_2",
      url: "/assets/Snip20121203_2.png"
    }
    @files = [file] * 6
  end
end
