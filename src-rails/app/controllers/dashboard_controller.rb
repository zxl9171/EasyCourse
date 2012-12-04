# encoding: utf-8
class DashboardController < ApplicationController
  def index
    begin
      redirect_to '/sessions/login'
      return
    end unless session[:uid]

    notif = {
      :avatar => '/assets/thumb_3f959077cac64c7b45793c743e22b7cc.jpg',
      :name => '小明',
      :title => '我们要不然就抄这个网站好了？',
      :content => 'R.T',
      :created_at => '刚刚'
    }
    @notifs = [notif, notif]

    file = {
      id: 3,
      title: "Snip20121203_2",
      url: "/assets/Snip20121203_2.png"
    }
    @files = [file] * 6
  end
end