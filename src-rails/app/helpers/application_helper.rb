# encoding: utf-8
module ApplicationHelper
  def render_header(header)
    render :partial => "misc/header", :locals => { :header => header }
  end

  def render_section_header(header, action_tip = nil, icon = nil, options = {})
    render :partial => "misc/section_header", :locals => { :section_header => header, :action_tip => action_tip, :icon => icon, :options => options }
  end

  def render_view_more(text = '', url = '')
    render :partial => "misc/view_more", :locals => { text: text, url: url }
  end

  def current_user
    {
      name: '小明',
      avatar: '/assets/thumb_3f959077cac64c7b45793c743e22b7cc.jpg'
    }
  end
end
