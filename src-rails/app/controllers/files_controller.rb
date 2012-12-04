require 'faker'

class FilesController < ApplicationController
  def index
    @files = 1.upto(6).map {|e| gen_file }
  end

  def show
    @file = gen_file
  end

private
  def gen_file
    file = {
      title: Faker::Lorem.sentence,
      user_name: Faker::Name.first_name,
      url: "/assets/Snip20121203_2.png",
      created_at: rand(10).to_i.day.ago
    }
  end
end
