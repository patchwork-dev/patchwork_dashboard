class KeywordFiltersController < ApplicationController
  load_and_authorize_resource

  def index
    respond_to do |format|
    format.html
    format.json {render json: prepare_filters_for_datatable}
    format.csv { 
      send_data KeywordFilter.all.to_csv(
        [
          'keyword',
          'is_active',
          'server_setting_id',
          'filter_type'
        ]
      )
    }
    end
  end

  def create
    if @keyword_filter.save
      redirect_to keyword_filters_url, notice: 'A filter keyword was successfully created!'
    else
      flash[:error] = @keyword_filter.errors.full_messages
      render :new
    end
  end

  def update
    if @keyword_filter.update(keyword_filter_params)
      redirect_to keyword_filters_url, notice: 'A filter keyword was successfully updated!'
    else
      flash[:error] = @keyword_filter.errors.full_messages
      render :edit
    end
  end

  def destroy
    @keyword_filter.destroy
    redirect_to keyword_filters_url, notice: 'A filter keyword was successfully destroyed!'
  end

  private

    def keyword_filter_params
      params.require(:keyword_filter).permit(:keyword, :filter_type, :server_setting_id, :is_active)
    end

    def prepare_filters_for_datatable
      @keyword_filters = @all = KeywordFilter.all

      @keyword_filters = @keyword_filters.where("keyword like :q", q: "%#{@q}%") if @q.present?

      @keyword_filters = @keyword_filters.order("#{@sort}": :"#{@dir}").page(@page).per(@per)
      
      @data = @keyword_filters.each_with_object([]) { |g, arr|
        arr << {
          keyword: g.keyword,
          is_active: g.is_active? ? 'Yes' : 'No',
          filter_type: g.filter_type,
          name: g.keyword_filter_group&.name || 'None',

        }
      }

      total_records  = @all.size
      total_filtered = @q.present? ? @keyword_filters.total_count : total_records

      {draw: params[:draw], recordsTotal: total_records, recordsFiltered: total_filtered, data: @data}
    end
end