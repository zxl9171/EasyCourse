# encoding: utf-8
class DashboardController < ApplicationController
  def index
    notif = {
              :avatar => '/assets/thumb_3f959077cac64c7b45793c743e22b7cc.jpg',
              :name => '小明',
              :title => '我们要不然就抄这个网站好了？',
              :content => 'R.T',
              :created_at => '刚刚'
            }
    @notifs = [notif, notif]
  end
end
