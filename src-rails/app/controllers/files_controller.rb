require 'faker'

class FilesController < ApplicationController
  def index
    @files = 6.times.map { gen_file }
  end

  def show
    @file = gen_file
    @comments = @file[:comments]
  end

private
  def gen_file
    file = {
      title: Faker::Lorem.sentence,
      user_name: Faker::Name.first_name,
      user_avatar: '/assets/thumb_3f959077cac64c7b45793c743e22b7cc.jpg',
      url: "/assets/Snip20121203_2.png",
      created_at: rand(10).to_i.day.ago,
      comments: 3.times.map { gen_comment }
    }
  end

  def gen_comment
    {
      user_name: Faker::Name.first_name,
      user_avatar: '/assets/thumb_3f959077cac64c7b45793c743e22b7cc.jpg',
      created_at: rand(10).to_i.day.ago,
      content: Faker::Lorem.paragraph
    }
  end
end
