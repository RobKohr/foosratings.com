$(document).ready(function(){
    $('#match_types div').click(function(){
	var match_type = $(this).attr('data-value');
	$('#field_match_type').val(match_type);
	$('#form_match').show();
	$('#match_types').hide();
	if(match_type=='1_vs_1'){
	    $('.not_teams').show();
	    $('.teams').hide();
	}else{
	    $('.not_teams').hide();
	    $('.teams').show();
	}

    });
});