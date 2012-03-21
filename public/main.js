    function activateType(type){
	$('.submit_type_button').css('opacity', '0.4');
	$('#submit_'+type).css('opacity', '1');
	$('#type').val(type);
	$('#input_row_text').hide().parent().find('textarea').removeAttr('required');
	$('#input_row_external_url').hide().parent().find('input').removeAttr('required');
	$('#input_row_text').hide();
	$('#input_row_external_url').hide();


	if(type=='text'){
	    $('#input_row_text').show().find('textarea').attr('required', 'required');
	    $('#input_row_text').show();
	    $('#input_row_external_url').hide();
	}else{
	    $('#input_row_external_url').show().find('input').attr('required', 'required');
	    $('#input_row_text').hide();
	}
	$('#label_external_url').text(utils.pretty(type)+' URL');
	$('#submit_form').show();
    }

function updateBTC(node_id, force_hide_show){
    $.getJSON('/update_btc/'+node_id, function(data){
	console.log(data);
	if((!data.unchanged)||(force_hide_show))
	    $('#btc_'+node_id).hide().text(data.btc.toFixed(3)+' BTC').show('slow');
    });
}


$(document).ready(function(){
    $('.vote_box').click(function(){
	$('.add_coins_pop').hide();
	$(this).parent().find('.add_coins_pop').show().find('.qrcode').each(function(){
	    var data = $(this).attr('data-qr_data');
	    $(this).empty();
	    $(this).qrcode({width:100,height:100,text:data});	
	});
    });

    $('.submit_type_button').click(function(){
	var type = $(this).attr('data-type');
	activateType(type);
    });

    $('#field_category').change(function(){
	if($(this).val()=='new category...'){
	    $('#input_row_category').hide();
	    $('#hidden_new_category').show();
	}
	   
    });

});
