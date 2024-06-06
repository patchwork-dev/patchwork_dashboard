import JQuery from 'jquery';
window.$ = window.JQuery = JQuery;
import 'bootstrap'
import 'admin-lte'
import "@nathanvda/cocoon"
import 'lib/datatable'
import './modal_handler';
import './api_util';
import './settings';
import './keyword_groups';
import './header';

import DataTable from 'datatables.net-bs4'
import 'datatables.net-select-bs4'

import {far} from '@fortawesome/free-regular-svg-icons'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {library} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-free'
library.add(far, fas, fab)

import Rails from '@rails/ujs'
Rails.start()

localStorage.setItem('selected', null);
localStorage.setItem('unselected', null);
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $('#keyFilterModal').on('hidden.bs.modal', function () {
    $(this).find('.alert.alert-danger').remove();
  });

  // multiple selection
  var table = $('#datatable').DataTable();

  table.on('draw', function() {
    $('tr').each(function() {
      var row = $(this);
      var checkbox = row.find('.checkbox');

      if (checkbox.is(':checked')) {
        row.addClass('selected');
      } else {
        row.removeClass('selected');
      }
    });
  });

  $('#datatable tbody').on('click', '.selectable-checkbox', function(e) {
    e.stopPropagation();

    var checkbox = $(this).find('input[type=checkbox]');
    var _id = checkbox.val();

    var unselected = JSON.parse(localStorage.getItem('unselected')) || [];
    var selected = localStorage.getItem('selected');

    if (selected !== 'all') {
      selected = JSON.parse(selected) || [];
    }

    var tr = $(this).closest('tr');
    if (!tr.hasClass('selected')) {
      checkbox.prop('checked', true);
      tr.addClass('selected');
      if (selected !== 'all') {
        selected.push(_id);
      }
      if (selected === 'all') {
        unselected = unselected.filter(function(id) {
          return id !== _id;
        });
      }
    } else {
      checkbox.prop('checked', false);
      tr.removeClass('selected');
      if (selected !== 'all') {
        selected = selected.filter(function(id) {
          return id !== _id;
        });
      }
      if (selected === 'all') {
        unselected.push(_id);
      }
    }

    if (selected === 'all') {
      if (unselected.length > 0) {
        $('#select_all').prop('checked', false);
        $('#select_all').prop('indeterminate', true);
      } else {
        $('#select_all').prop('checked', true);
        $('#select_all').prop('indeterminate', false);
      }
    }

    addParams(selected, unselected);

    if (selected !== 'all') {
      selected = JSON.stringify(selected);
    }
    unselected = JSON.stringify(unselected);

    if (selected !== 'all') {
      localStorage.setItem('selected', selected);
    }
    localStorage.setItem('unselected', unselected);
  });


  $('#select_all').on('change', function(e) {
    localStorage.setItem('unselected', null);

    if ($(this).is(':checked')) {
      $('tbody tr').addClass('selected');
      $("input[type='checkbox']").prop('checked', true);
      addParams('all');
      localStorage.setItem('selected', 'all');
    } else {
      $('tbody tr').removeClass('selected');
      $("input[type='checkbox']").prop('checked', false)
      addParams();
      localStorage.setItem('selected', null);
    }
  })

  $('input[type="search"]').on('change', function(e) {
    addParams();
  })
  // end of multiple selection

  $(document).on('change', '.deprecate-version-checkbox', function(e) {
    e.preventDefault();
    var id = $(e.currentTarget).val();
    $.ajax({
      url: `/history/${id}/deprecate`,
      method: 'PUT',
      dataType: 'json',
      success: function(response) {
        console.log('Update successful!', response);
      },
      error: function(xhr, status, error) {
        console.error('Update failed:', error);
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    const nestedAttributeContainer = document.querySelector('.nested-fields');

    if (nestedAttributeContainer && nestedAttributeContainer.children.length === 0) {
      const addNewLink = nestedAttributeContainer.querySelector('.add_fields');
      if (addNewLink) {
        addNewLink.click();
      }
    }
  });
})

const addParams = (selected = null, unselected = null) => {
  const btn = $('#export-selected');
  const q = $('input[type="search"]').val();
  let url = new URL($(btn).attr('href'));
  const params = new URLSearchParams(url.search);

  params.delete('selected');
  params.delete('unselected');
  params.delete('q');

  if (selected !== null) {
    params.set('selected', selected);
  }

  if (unselected !== null) {
    params.set('unselected', unselected);
  }

  if (q !== null && q.trim() !== '') {
    params.set('q', q);
  }

  url.search = params.toString();
  $(btn).attr('href', url.href);
};


const togglePassword = (e) => {
	let input = document.querySelector('input#password');

	if (input.type == 'password') {
		e.setAttribute('class', 'svg-inline--fa fa-eye');
		input.type = 'text';
	} else {
		e.setAttribute('class', 'svg-inline--fa fa-eye-slash');
		input.type = 'password';
	}

}

jQuery(function () {
  $('.select2').select2({
    placeholder: 'Select an option',
    allowClear: true
  });
})

window.togglePassword = togglePassword;
