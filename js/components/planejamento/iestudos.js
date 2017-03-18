function bloquearLinks() {
    $('#logo,.breadcrumbs > a,.links > li > a').on('click', function(e) {
        var acao = 'ir para a página inicial';
        if ($.inArray(this.textContent, ['Assine', 'Contato', 'Blog']) != -1) {
            acao = 'sair dessa página';
        }
        if (!confirm('Deseja ' + acao + ' sem salvar nenhum dado do planejamento?')) {
            e.preventDefault();
        }
    });
    $('.tooltip-w').tipsy({
        gravity: 'w'
    }).on('click', function() {
        tutorial.mostrar();
    });
    $('#tutorial .fechar-notificacao').on('click', function(e) {
        e.preventDefault();
        $(this).parent().hide();
    });
}

function byId(id) {
    return document.getElementById(id);
};
var limiteLinhas = 33;
var naoSeiData = {
    anterior: '',
    alternar: function(inicial) {
        if (byId('dtDesc').checked) {
            this.anterior = $('#Planejamento_data_prova').val();
            var dt1Ano = new Date(adicionarDiasMils(new Date().getTime(), 180));
            $('#Planejamento_data_prova').attr('disabled', 'disabled').val(dt1Ano.obterString());
            $('#descritor-cal').text('Data provisória para daqui a 6 meses, corrija quando souber a data exata.');
        } else {
            $('#Planejamento_data_prova').removeAttr('disabled');
            if (inicial) {
                $('#Planejamento_data_prova').val(this.anterior);
            }
            calcularDias();
        }
    }
};

function iniciarPasso1(mostrarBemVindo) {
    bloquearLinks();
    $('#dtDesc').on('click', naoSeiData.alternar);
    $('.fechar-notificacao').on('click', function(e) {
        e.preventDefault();
        $(e.target).parent().hide();
    });
    $('#Planejamento_data_prova').on('change', calcularDias);
    naoSeiData.alternar(false);
    if (mostrarBemVindo) {
        tutorial.bemvindo();
    } else {
        $('#Planejamento_nome').focus();
    }
}
var tutorial = {
    mostrar: function() {
        $('#tutorial').toggle();
    },
    esconder: function() {
        tutorial.esconderFundo();
        $('#tut-passo' + tutorial.passo).hide();
    },
    bemvindo: function() {
        this.mostrarFundo();
        this.mostrarElementosBV();
    },
    mostrarElementosBV: function() {
        $('<div class="tut-texto" id="bem-vindo"><h1>Bem-vindo ao iEstudos!</h1>' + '<p class="texto">A seguir você deverá informar alguns dados que serão utilizados para criar o seu planejamento.<br/>' + '<p class="texto">Se não tiver certeza de algum desses dados, não se preocupe, <strong>você poderá alterá-los posteriormente sem problema.</strong></p><br/>' + '<input type="button" id="criar-planej" class="botao laranja" value="OK, criar meu planejamento" /></div>').insertAfter($('.breadcrumbs'));
        $('#criar-planej').on('click', tutorial.esconderFundoBV);
    },
    mostrarFundo: function() {
        $('<div class="reveal-modal-bg escuro" style="display:block;">').on('click', tutorial.esconderFundoBV).appendTo($('body'));
    },
    esconderFundo: function() {
        $('.reveal-modal-bg').remove();
    },
    esconderFundoBV: function() {
        $('.reveal-modal-bg,#bem-vindo').remove();
        $('#Planejamento_nome').focus();
    }
};

function calcularDias() {
    var dataProva = $('#Planejamento_data_prova').val();
    if (dataProva != '') {
        var periodoDias = obterDiasEntreDatas(new Date(), dataProva.obterData()) + 1;
        if (periodoDias == 0) {
            $('#descritor-cal').text('Hoje');
        } else if (periodoDias > 0) {
            if (periodoDias == 1) {
                $('#descritor-cal').text('Amanhã');
            } else {
                $('#descritor-cal').text('Daqui a ' + periodoDias + ' dias');
            }
        } else {
            $('#descritor-cal').text('A ' + Math.abs(periodoDias) + ' dias atrás');
        }
    } else {
        $('#descritor-cal').html('&nbsp;');
    }
}

function iniciarPasso2(mostrarGrafico, linhas) {
    $('#Materia_0_nome').focus();
    criarWidgetsEHandlers($('div.linha-materia:visible'));
    bloquearLinks();
    $('#planejamento-passo2-form').on('submit', validarFormulario);
    $('.adicionar').on('click', adicionarLinhaMateria).tipsy({
        gravity: 'w',
        delayIn: 400
    });
    $('#imp-dific').on('click', function(e) {
        e.preventDefault();
    });
    calcularPorcentagemMaterias();
    $(document).on({
        'keyup': function(e) {
            if (e.which == 17) {
                ctrlPressionado = false;
            }
        },
        'keydown': function(e) {
            if (e.which == 17) {
                ctrlPressionado = true;
            }
            if (e.which == 13 && ctrlPressionado == true) {
                adicionarLinhaMateria();
            }
        }
    });
    if (mostrarGrafico) {
        google.load('visualization', '1.0', {
            'packages': ['corechart'],
            'callback': function() {
                desenharGrafico(linhas);
            }
        });
    } else {
        google.load('visualization', '1.0', {
            'packages': ['corechart']
        });
    }
}
var ctrlPressionado = false;

function comparacaoPersonalizada(request, response) {
    var matcher = new RegExp('^' + $.ui.autocomplete.escapeRegex(request.term), 'i');
    response($.grep(arrayMaterias, function(value) {
        return matcher.test(value) || matcher.test(value.removerAcentos());
    }));
}

function adicionarLinhaMateria() {
    var linhas = $('.linha-materia:visible');
    var qtdLinhas = linhas.size();
    if (qtdLinhas < limiteLinhas) {
        var linhaClonada = $('#linha-template').clone();
        linhaClonada.html(linhaClonada.html().replace(/\?/g, qtdLinhas).replace(/\%/g, qtdLinhas + 1)).removeAttr('id').insertAfter(linhas.eq(qtdLinhas - 1));
        criarWidgetsEHandlers(linhaClonada);
        calcularPorcentagemMaterias();
        linhaClonada.find('#Materia_' + qtdLinhas + '_nome').focus();
    }
}

function excluirLinhaMateria(botao) {
    var linhas = $('.linha-materia:visible');
    if (linhas.size() != 1) {
        var linhaRemovida = $(botao).parents('div[class=linha-materia]');
        $(".tipsy").remove();
        linhaRemovida.detach();
        $(".tooltip-direita").tipsy({
            gravity: 'w'
        });
        refazerIndicesDasLinhas(linhas.not(linhaRemovida));
        calcularPorcentagemMaterias();
        redesenharGrafico();
    } else {
        limparLinha($(botao).parents('div[class=linha-materia]'));
    }
}

function zerarPorcentagem(botao) {
    $(botao).parent().parent().find('.ui-slider').slider('value', 0);
}

function limparLinha(linha) {
    linha.find('.materia-nome input:text').val('');
    linha.find('.ui-slider').slider('value', 50);
}

function refazerIndicesDasLinhas(linhas) {
    for (var i = 0; i < linhas.size(); i++) {
        var elemento = linhas[i];
        var indiceAntigo = elemento.children[0].children[0].id.substring(8, 10);
        if (indiceAntigo.indexOf('_') != -1) {
            indiceAntigo = indiceAntigo.substring(0, 1);
        }
        var materiaNome = document.getElementById('Materia_' + indiceAntigo + '_nome');
        materiaNome.setAttribute('id', 'Materia_' + i + '_nome');
        materiaNome.setAttribute('name', 'Materia[' + i + '][nome]');
        var materiaPorc = document.getElementById('Materia_' + indiceAntigo + '_mostrador_porcentagem');
        materiaPorc.setAttribute('id', 'Materia_' + i + '_mostrador_porcentagem');
        var materiaPorcentagem = document.getElementById('Materia_' + indiceAntigo + '_porcentagem');
        materiaPorcentagem.setAttribute('id', 'Materia_' + i + '_porcentagem');
        materiaPorcentagem.setAttribute('name', 'Materia[' + i + '][porcentagem]');
        var materiaOrdem = document.getElementById('Materia_' + indiceAntigo + '_ordem');
        materiaOrdem.setAttribute('id', 'Materia_' + i + '_ordem');
        materiaOrdem.setAttribute('name', 'Materia[' + i + '][ordem]');
        var materiaImportancia = document.getElementById('Materia_' + indiceAntigo + '_importancia');
        materiaImportancia.setAttribute('id', 'Materia_' + i + '_importancia');
        materiaImportancia.setAttribute('name', 'Materia[' + i + '][importancia]');
        var materiaDificuldade = document.getElementById('Materia_' + indiceAntigo + '_dificuldade');
        materiaDificuldade.setAttribute('id', 'Materia_' + i + '_dificuldade');
        materiaDificuldade.setAttribute('name', 'Materia[' + i + '][dificuldade]');
    }
}

function calcularPorcentagemMaterias() {
    var porcentagens = [];
    var valorTotal = 0;
    for (var i = 0;; i++) {
        var hiddenImportancia = document.getElementById('Materia_' + i + '_importancia');
        if (hiddenImportancia == undefined) {
            break;
        }
        var valorLinha = +hiddenImportancia.value * +document.getElementById('Materia_' + i + '_dificuldade').value;
        valorTotal += valorLinha;
        porcentagens[i] = valorLinha;
    }
    for (var i = 0; i < porcentagens.length; i++) {
        var porcentagemMateria = arredondarParaUmaCasaDecimal((100 / valorTotal) * porcentagens[i]);
        document.getElementById('Materia_' + i + '_mostrador_porcentagem').value = porcentagemMateria + '%';
        document.getElementById('Materia_' + i + '_porcentagem').value = porcentagemMateria;
    }
}

function removerErros() {
    $('.errorMessage').hide();
    $.each($('input[name^=Materia]:visible'), function() {
        $(this).removeClass('error');
    });
}

function validarFormulario() {
    $('.errorMessage').hide();
    var valido = true;
    var linhas = $('input[name^=Materia]:visible');
    for (var i = 0; i < linhas.length; i++) {
        var mensagem = null;
        var elemento = $(linhas[i]);
        var valor = elemento.val();
        var iguais = [];
        elemento.removeClass('error');
        if ($.trim(valor) == '') {
            mensagem = 'Nome da matéria não pode ser vazio';
            valido = false;
        } else if (valor.length < 3) {
            mensagem = 'Nome da matéria é muito curto (mínimo é 3 caracteres)';
            valido = false;
        } else {
            for (var j = 0; j < linhas.length; j++) {
                if (i != j && $.trim(linhas[j].value) === $.trim(valor)) {
                    iguais.push(linhas[j]);
                }
            }
            if (iguais.length != 0) {
                mensagem = 'Não podem ter matérias com o mesmo nome';
                valido = false;
            }
        }
        if (mensagem != null) {
            elemento.siblings('.errorMessage').text(mensagem);
            elemento.addClass('error');
            elemento.siblings('.errorMessage').show();
            $('.mostrador-erros').show();
        }
    }
    return valido;
}

function modificarSlider(evento) {
    evento.preventDefault();
    var link = $(evento.target);
    var slider = link.parent().find('.ui-slider');
    var valorAtual = +slider.slider('option', 'value');
    if (link.hasClass('mais')) {
        slider.slider('value', valorAtual + 5);
    } else {
        slider.slider('value', valorAtual - 5);
    }
}

function atualizarSlider(e, ui) {
    e.target.nextSibling.nextSibling.value = ui.value;
    calcularPorcentagemMaterias();
}

function atualizarGraficoESlider(e, ui) {
    atualizarSlider(e, ui);
    redesenharGrafico();
}

function criarWidgetsEHandlers(elemento) {
    $.each(elemento.find('div[class^=slider]'), function() {
        $(this).slider({
            range: 'min',
            value: $(this).siblings('input:hidden').val(),
            min: 0,
            max: 100,
            slide: function(e, ui) {
                atualizarSlider(e, ui);
                if (window.chrome && $('.linha-materia:visible').length < 8) {
                    redesenharGrafico();
                }
            },
            change: atualizarGraficoESlider
        });
    });
    elemento.find('.materia-nome > input:text').autocomplete({
        minLength: 0,
        autoFill: true,
        autoFocus: true,
        delay: 0,
        source: comparacaoPersonalizada
    }).on('blur', function() {
        removerErros();
        redesenharGrafico();
    });
    $.each(elemento.find('.ui-autocomplete-input'), function() {
        $(this).data('autocomplete')._renderItem = function(ul, item) {
            var re = new RegExp('^(' + $.ui.autocomplete.escapeRegex(this.term) + ')', 'gi');
            var highlightedResult = item.label.replace(re, '<strong>$1</strong>');
            return $('<li></li>').data('item.autocomplete', item).append('<a>' + highlightedResult + '</a>').appendTo(ul);
        };
    });
    elemento.find('.tooltip-direita').tipsy({
        gravity: 'w'
    });
    elemento.find('a.controle-slider').on('click', modificarSlider);
}

function arredondarParaUmaCasaDecimal(numero) {
    return (isNaN(numero) ? 0.0 : Math.floor(numero * 100) / 100).toFixed(1);
}

function desenharGrafico(linhas) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Matéria');
    data.addColumn('number', 'Porcentagem');
    data.addRows(linhas);
    new google.visualization.PieChart(document.getElementById('grafico')).draw(data, {
        width: 400,
        height: 300,
        sliceVisibilityThreshold: 0,
        chartArea: {
            width: '100%',
            height: '90%'
        },
        tooltip: {
            showColorCode: true,
            text: 'percentage'
        },
        fontName: 'Segoe UI, Arial'
    });
}

function redesenharGrafico() {
    var linhas = [];
    for (var i = 0;; i++) {
        var inputNome = document.getElementById('Materia_' + i + '_nome');
        if (inputNome == undefined) {
            break;
        }
        if (inputNome.value != '') {
            linhas.push([inputNome.value, parseFloat(document.getElementById('Materia_' + i + '_porcentagem').value)]);
        }
    }
    if (linhas.length > 0) {
        desenharGrafico(linhas);
    }
}
var arrayMaterias = ["Acionamentos e controles elétricos", "Administração de Recursos Materiais", "Administração Financeira e Orçamentária", "Administração Geral", "Administração Pública", "Agronomia", "Álgebra", "Algoritmos e Estrutura de Dados", "Análise de Balanços", "Análise de sistemas elétricos", "Anatomia Aplicada à Odontologia ", "Anatomia Dental", "Anatomia Humana", "Antropologia", "Aritmética", "Arquivologia", "Arquitetura", "Arquitetura de Computadores", "Arquitetura de Software", "Arquivologia", "Artes Gráficas", "Atendimento (Escriturário)", "Atendimento ao Público", "Atualidades", "Atuária", "Áudio e Vídeo", "Auditoria", "Auditoria de Obras Públicas", "Auditoria Governamental", "Banco de Dados", "Biblioteconomia", "Biologia", "Censo", "Ciências da Natureza e suas Tecnologias", "Ciências Humanas e suas Tecnologias", "Ciências Políticas", "Ciências Sociais", "Circuitos elétricos", "Código de Organização Judiciária", "Código Disciplinar da Polícia Militar do Estado do Ceará", "Comércio Internacional (Exterior)", "Computação", "Comunicação Social", "Conhecimentos Bancários", "Conhecimentos de Serviços Gerais", "Conhecimentos Gerais", "Contabilidade Bancária", "Contabilidade Comercial", "Contabilidade de Custos", "Contabilidade de Seguros", "Contabilidade Geral", "Contabilidade Gerencial ", "Contabilidade Pública", "Contabilidade Tributária", "Controle Externo", "Correição no Poder Executivo Federal", "Crescimento e Desenvolvimento Econômico", "Criminalística", "Criminologia", "Cultura Geral", "Desenho Industrial", "Designer Gráfico", "Direito Administrativo", "Direito Agrário", "Direito Ambiental", "Direito Civil", "Direito Comercial (Empresarial)", "Direito Comunitário", "Direito Constitucional", "Direito da Criança e do Adolescente", "Direito do Consumidor", "Direito do Trabalho", "Direito Econômico-Financeiro", "Direito Eleitoral", "Direito Internacional Privado", "Direito Internacional Público", "Direito Marítimo", "Direito Notarial e Registral", "Direito Penal", "Direito Penal Militar", "Direito Previdenciário", "Direito Processual Civil", "Direito Processual do Trabalho", "Direito Processual Penal", "Direito Processual Penal Militar", "Direito Sanitário", "Direito Tributário", "Direito Urbanístico", "Direitos Difusos e Coletivos", "Direitos Humanos", "Discursiva", "Econometria", "Economia", "Economia Brasileira", "Economia do Trabalho", "Economia internacional", "Edificações", "Educação Física", "Eletricidade", "Eletroeletrônica", "Eletromagnetismo", "Eletrônica Analógica", "Eletrônica de Potência", "Eletrônica Digital", "Endodontia", "Enfermagem", "Engenharia Aeronáutica", "Engenharia Agronômica", "Engenharia Ambiental", "Engenharia Civil", "Engenharia de Automação e Controle", "Engenharia de Materiais", "Engenharia de Minas", "Engenharia de Pesca", "Engenharia de Produção", "Engenharia de Qualidade", "Engenharia de Software", "Engenharia de Telecomunicações", "Engenharia Elétrica", "Engenharia Eletrônica", "Engenharia Florestal", "Engenharia Mecânica", "Engenharia Naval", "Engenharia Química", "Engenharia Sanitária", "Epidemiologia", "Espanhol", "Estatística", "Estatuto da Advocacia e da OAB", "Estatuto dos Militares Estaduais do Ceará", "Ética na Administração Pública", "Farmácia", "Filosofia e Ética", "Filosofia e Sociologia do Direito", "Finanças", "Finanças Públicas", "Física", "Fisioterapia", "Fonoaudiologia", "Francês", "Geografia", "Geologia", "Geometria", "Geometria Analítica", "Geração, transmissão e distribuição de energia elétrica.", "Gerência de Projetos", "Gerenciamento do Risco", "Gestão Ambiental", "Gestão de Investimento", "Gestão de Pessoas", "Gestão de Produtos e Operações", "Gestão Documental Pública", "Gestão Financeira", "Gestão de TI", "Governança de TI", "História Antiga", "História do Brasil", "História e Geografia de Estados e Municípios", "História e Geografia de Minas Gerais", "História e Geografia de Rondônia", "História e Geografia do Amapá", "História e Geografia do Rio Grande do Norte", "História Econômica, Administrativa e Política de São Paulo", "História Geral", "História Mundial", "Informática", "Inglês", "Instalações elétricas", "Jornalismo", "Legislação da AGU", "Legislação da DPU", "Legislação de Seguros", "Legislação de Trânsito", "Legislação do MPE", "Legislação do MPU", "Legislação Estadual", "Legislação Federal", "Legislação Municipal", "Legislação Tributária", "Legislação Tributária do AP", "Legislação Tributária do RN", "Lei Orgânica do DF", "Leis Orgânicas", "Lingua Portuguesa", "Linguagens e Códigos e suas Tecnologias", "Literatura", "Logística", "Macroeconomia", "Máquinas elétricas", "Marketing", "Matemática", "Matemática Atuarial", "Matemática e suas Tecnologias", "Matemática Financeira", "Mecânica de Autos", "Medicina", "Medicina do Trabalho", "Medicina Legal", "Medidas elétricas", "Meio Ambiente", "Meteorologia", "Metodologia da Investigação Policial", "Microeconomia", "Modelagem de Processos de Negócio (BPM)", "Museologia", "Noções de Arquivologia", "Noções de Informática", "Noções de Telecomunicações", "Nutrição", "Oceanografia Geológica", "Odontologia", "Organização da Justiça Militar da União", "Organização Judiciária", "Papiloscopia", "Patologia", "Patologia e Semiologia Odontológicas", "Pedagogia", "Periodontia", "Política Internacional", "Políticas Nacionais", "Políticas Sociais e de Infra-Estrutura no Brasil", "Português", "Primeiros Socorros", "Princípios, Normas e Atribuições Institucionais", "Programação", "Psicologia", "Psicologia Jurídica", "Psiquiatria", "Química", "Raciocínio-Lógico", "Redação", "Redação Oficial", "Redes de Computadores", "Regime Jurídico do Ministério Público", "Regimento Interno", "Relações Humanas", "Relações Públicas", "Saúde Pública", "Secretariado", "Segurança da Informação", "Segurança e Saúde no Trabalho", "Segurança e Transporte", "Segurança Pública", "Serviço Social", "Sistema Elétrico Brasileiro", "Sistema Financeiro Nacional", "Sistemas de controle", "Sistemas de Informação", "Sistemas Operacionais", "Sociologia", "Supervisão de Instituições Financeiras", "Telecomunicações", "Teoria Geral da Administração", "Teoria Geral do Processo", "Teoria Política Aplicada", "Trigonometria", "Turismo", "Veterinária"];

function iniciarPasso3(temTempoHoje) {
    bloquearLinks();
    calcularDiasEntreDatas();
    $('#links-modo-dia a').on('click', alterarModoDeMarcacaoDosDias);
    $('#tempo-estudo div.marcador input[type=button]').on('click', calcularTempoDeEstudo);
    $('#duracao-planejamento select').on('change', calcularDiasEntreDatas);
    if (temTempoHoje && $('#Planejamento_data_inicio option:eq(0)').val() == $('#Planejamento_data_inicio').val()) {
        alerta.tempo();
    }
}
var diasComplementares = ['terca', 'quarta', 'quinta', 'sexta'];
var alerta = {
    tempo: function() {
        $('#Planejamento_data_inicio').tipsy({
            html: true,
            gravity: 'w',
            trigger: 'manual',
            title: function() {
                return '<p>Esse planejamento possui tempo de estudo registrado hoje.</p>' + '<p>Se você editar a partir de hoje, esse tempo <strong>será apagado</strong></p>' + '<input type="button" class="botao laranja" value="Manter hoje" onclick="alerta.cancelar();" />' + '<input type="button" class="botao laranja" value="Mudar para amanhã" onclick="alerta.alterar()" />';
            }
        });
        $('#Planejamento_data_inicio').tipsy('show');
    },
    cancelar: function() {
        $('#Planejamento_data_inicio').tipsy('hide');
    },
    alterar: function() {
        $('#Planejamento_data_inicio option:last').attr('selected', 'selected');
        this.cancelar();
    }
};

function alterarModoDeMarcacaoDosDias() {
    if ($(this).hasClass('separar-dias')) {
        $('.tempo-disponivel').addClass('pq');
        var marcadorSegunda = $('#tempo-estudo .tempo-disponivel:eq(0)');
        marcadorSegunda.find('.descricao-dia').text('segunda');
        var ultimoElemento = marcadorSegunda;
        var regex = new RegExp('segunda', 'g');
        for (i in diasComplementares) {
            $('#Planejamento_minutos_' + diasComplementares[i]).detach();
            var marcador = marcadorSegunda.clone();
            marcador.html(marcador.html().replace(regex, diasComplementares[i])).insertAfter(ultimoElemento);
            marcador.find('div.marcador input[type=button]').on('click', calcularTempoDeEstudo);
            if (diasComplementares[i] == 'terca') {
                marcador.find('.descricao-dia').text('terça');
            }
            ultimoElemento = marcador;
        }
    } else {
        $('.tempo-disponivel').removeClass('pq');
        $('#tempo-estudo div.tempo-disponivel:eq(0) .descricao-dia').text('dia de semana');
        for (var i in diasComplementares) {
            var dia = diasComplementares[i];
            $('#Planejamento_minutos_' + dia).parent().parent().detach();
            $('<input>').attr({
                type: 'hidden',
                name: 'Planejamento[minutos_' + dia + ']',
                id: 'Planejamento_minutos_' + dia,
                value: '0'
            }).appendTo($('#planejamento-passo3-form'));
        }
    }
    $(this).addClass('oculto');
    $('#links-modo-dia a').not($(this)).removeClass('oculto');
    calcularTempoDeEstudo();
}
var dias;

function calcularDiasEntreDatas() {
    dias = {
        'deSemana': 0,
        'segunda': 0,
        'terca': 0,
        'quarta': 0,
        'quinta': 0,
        'sexta': 0,
        'sabado': 0,
        'domingo': 0,
        'total': 0
    };
    var tempoIteracao = converterStringEmDataMils($('#Planejamento_data_inicio').val());
    var dataFim = converterStringEmDataMils($('#Planejamento_data_fim').val());
    while (tempoIteracao <= dataFim) {
        var diaDaSemana = new Date(tempoIteracao).getDay();
        if (diaDaSemana != 0 && diaDaSemana != 6) {
            dias['deSemana'] = dias['deSemana'] + 1;
            if (diaDaSemana == 1) {
                dias['segunda'] = dias['segunda'] + 1;
            } else if (diaDaSemana == 2) {
                dias['terca'] = dias['terca'] + 1;
            } else if (diaDaSemana == 3) {
                dias['quarta'] = dias['quarta'] + 1;
            } else if (diaDaSemana == 4) {
                dias['quinta'] = dias['quinta'] + 1;
            } else if (diaDaSemana == 5) {
                dias['sexta'] = dias['sexta'] + 1;
            }
        } else if (diaDaSemana == 6) {
            dias['sabado'] = dias['sabado'] + 1;
        } else if (diaDaSemana == 0) {
            dias['domingo'] = dias['domingo'] + 1;
        }
        dias['total'] = dias['total'] + 1;
        tempoIteracao = adicionarDiasMils(tempoIteracao, 1);
    }
    $('#total-dias').text(dias['total']);
    calcularTempoDeEstudo();
}

function calcularTempoDeEstudo() {
    var minutosPlanejadosDeDiasDeSemana = obterMinutosPlanejadosDeDiasDeSemana();
    var minutosPlanejadosSabado = obterMinutosDoDia('sabado') * dias['sabado'];
    var minutosPlanejadosDomingo = obterMinutosDoDia('domingo') * dias['domingo'];
    var minutosPlanejadosTotal = minutosPlanejadosDeDiasDeSemana + minutosPlanejadosSabado + minutosPlanejadosDomingo;
    $('#Planejamento_minutos_planejados').val(minutosPlanejadosTotal);
    if ($('.agrupar-dias').hasClass('oculto')) {
        for (i in diasComplementares) {
            $('#Planejamento_minutos_' + diasComplementares[i]).val($('#Planejamento_minutos_segunda').val());
        }
    }
}

function obterMinutosPlanejadosDeDiasDeSemana() {
    var minutosPlanejados;
    if ($('.agrupar-dias').hasClass('oculto')) {
        minutosPlanejados = obterMinutosDoDia('segunda') * dias['deSemana'];
    } else {
        minutosPlanejados = obterMinutosDoDia('segunda') * dias['segunda'] +
            obterMinutosDoDia('terca') * dias['terca'] +
            obterMinutosDoDia('quarta') * dias['quarta'] +
            obterMinutosDoDia('quinta') * dias['quinta'] +
            obterMinutosDoDia('sexta') * dias['sexta'];
    }
    return minutosPlanejados;
}

function obterMinutosDoDia(id) {
    var valor = $('[id=Planejamento_minutos_' + id + ']').val();
    return converterStringEmNumero(valor);
}

function obterDiferencaEmDias(data1, data2) {
    return (data2.getTime() - data1.getTime()) / (1000 * 60 * 60 * 24);
}

function modificarTempo(tipo, operador, intervalo, limiteHoras, limiteMinutos, elemento) {
    var caixa = elemento.parentNode.parentNode;
    var hidden = $(caixa).find('input:hidden');
    var valorHidden = +hidden.val();
    var resultado = 0;
    var tempoLimite = limiteHoras * 60 + limiteMinutos;
    if (tipo == 'minutos') {
        resultado = (operador == '+' ? (valorHidden + intervalo) : (valorHidden - intervalo));
    } else {
        resultado = (operador == '+' ? (valorHidden + intervalo * 60) : (valorHidden - intervalo * 60));
    }
    if (resultado <= tempoLimite && resultado >= 0) {
        var h = parseInt(resultado / 60);
        var m = (resultado != 0 && resultado % 60 != 0 ? resultado - (h * 60) : 0);
        $(caixa).find('.horas > div > p').text(completarComZero(h));
        $(caixa).find('.minutos > div > p').text(completarComZero(m));
        hidden.val(resultado);
    }
}

function converterStringEmNumero(string) {
    return (string == '' ? 0 : parseInt(string, 10));
}
var dias;
var tempo = {
    MILISEGUNDOS_UM_DIA: 86400000,
    MILISEGUNDOS_UMA_HORA: 3600000
};
var diasSemanaMin = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
var c = 0;

function iniciarPasso4(tipoGrade, descritorGrade, dataInicio, dataFim, indicePadrao) {
    bloquearLinks();
    passo4.criarAcoes();
    grade.definirOpcoesIniciais(tipoGrade, descritorGrade, dataInicio, dataFim, indicePadrao);
    grade.criar(tipoGrade);
    $('.passo-habilitado').on('click', function() {
        if (c++ == 4) {
            $('#painel-tipo-grade').children().last().show()
        }
    });
}
var passo4 = {
    criarAcoes: function() {
        $('a[class=fechar-notificacao]').on('click', function(e) {
            e.preventDefault();
            $(e.target).parent().hide();
        });
        $('input.botao[name=salvar]').on('click', grade.salvar);
        $.each($('input:radio[name="Planejamento[tipo_grade]"]'), function(i) {
            $(this).on('click', function() {
                grade.criar(i);
            });
        });
        var comboDescritor = $('#descritor-dias');
        for (i = 0; i < materias.length; i++) {
            $("<option />", {
                value: i + 1,
                text: i + 1
            }).appendTo(comboDescritor);
        }
        $('#descritor-dias').on('change', function() {
            grade.descritorDias.atualizar();
            grade.criar(2);
        });
        $('.movim').on('click', opcoesMaterias.movimentar);
        $('.temp-ciclo').on('change', opcoesMaterias.alterarTempo);
        opcoesMaterias.sincronizarComGrade();
    }
};
var opcoesMaterias = {
    sincronizarComGrade: function() {
        if (byId('tipo-grade-1').checked) {
            $('.tempo,.tmp-per,#opcoes-ciclo').show();
            $('#ordem-mat').hide();
            for (m in materias) {
                var selects = $('input:hidden[class=indice][value=' + materias[m].indice + ']').parent().find('select');
                var minutosCiclo = materias[m].minutos_ciclo;
                var horas = parseInt(minutosCiclo / 60, 10);
                $(selects[0]).val(completarComZero((minutosCiclo != 0 ? horas : 1)));
                $(selects[1]).val(completarComZero(minutosCiclo - (horas * 60)));
                if (minutosCiclo == 0) {
                    materias[m].minutos_ciclo = 60;
                }
            }
            $('.ordenavel select:disabled').val('00');
        } else {
            $('.tempo,.tmp-per,#opcoes-ciclo').hide();
            $('#ordem-mat').show();
        }
    },
    alterarTempo: function() {
        if ($(this).is('.horas')) {
            var horas = this.value;
            var minutos = (horas == 0 ? 30 : $(this.parentNode).find('.minutos').val());
        } else {
            var horas = $(this.parentNode).find('.horas').val();
            var minutos = (this.value == 0 && horas == 0 ? 30 : this.value);
        }
        var minutosC = (horas * 60) + +minutos;
        var nome = $(this.parentNode).parent().find('.nome').text();
        for (m in materias) {
            if (materias[m].nome == nome) {
                materias[m].minutos_ciclo = minutosC;
                break;
            }
        }
        grade.recriar();
    },
    movimentar: function(e) {
        e.preventDefault();
        var linha = $(this.parentNode.parentNode);
        if ($(this).is('.subir')) {
            if (linha.prev().is('.ordenavel')) {
                linha.insertBefore(linha.prev());
            }
        } else {
            if (linha.next().is('.ordenavel')) {
                linha.insertAfter(linha.next());
            }
        }
        materias.sort(function(a, b) {
            return a.indice - b.indice;
        });
        $.each($('.ordenavel'), function(i) {
            var ordem = i + 1;
            $(this).find('.ord').text(ordem);
            materias[$(this).find('.indice').val()].ordem = ordem;
        });
        grade.recriar();
    }
};
var grade = {
    dias: [],
    dataInicio: null,
    dataFim: null,
    indicePadrao: 0,
    indiceMaterias: 0,
    definirOpcoesIniciais: function(tipoGrade, descritorGrade, dataInicio, dataFim, indicePadrao) {
        this.setarDescritor(tipoGrade, descritorGrade);
        this.dataInicio = converterStringEmDataMils(dataInicio);
        this.dataFim = converterStringEmDataMils(dataFim);
        this.indicePadrao = indicePadrao;
    },
    resetar: function() {
        this.dias = [];
        this.indiceMaterias = this.indicePadrao;
        materia = null;
        for (var i in materias) {
            materias[i].restante = materias[i].minutos_divisao;
            materias[i].minutos_planejados = 0;
        }
    },
    recriar: function() {
        this.criar($('[name="Planejamento[tipo_grade]"]:checked').val());
    },
    criar: function(tipo) {
        grade.resetar();
        opcoesMaterias.sincronizarComGrade();
        var iteracao = {
            padrao: 0,
            minutos: 0,
            sobra: 0,
            materias_por_dia: 0,
            variavel: false
        };
        if (tipo == 0) {
            $('#ordem-m,#grade-estudos,#lb-grd').hide();
        } else {
            $('#ordem-m,#grade-estudos,#lb-grd').show();
        }
        if (tipo == 1) {
            this.descritorDias.desabilitar();
            iteracao.variavel = true;
        } else if (tipo == 2) {
            this.descritorDias.atualizar();
            iteracao.materias_por_dia = +$('#Planejamento_descritor_grade').val();
        } else {
            this.descritorDias.desabilitar();
        }
        var tempoIteracao = grade.dataInicio;
        while (tempoIteracao <= grade.dataFim) {
            this.dias.push(this['criarDiaTipo' + tipo](tempoIteracao, iteracao));
            tempoIteracao = adicionarDiasMils(tempoIteracao, 1);
        }
        this.desenharTabela();
    },
    obterProximaMateria: function() {
        var materia;
        var zeradas = 0;
        do {
            if (this.indiceMaterias == materias.length) {
                this.indiceMaterias = 0;
            }
            for (m in materias) {
                if (materias[m].ordem - 1 == this.indiceMaterias) {
                    materia = materias[m];
                    break;
                }
            }
            this.indiceMaterias++;
            if (zeradas > materias.length + 1) {
                materia.restante = 30;
            }
            zeradas++;
        } while (materia.restante <= 0);
        return materia;
    },
    criarDiaTipo0: function(tempoIteracao, iteracao) {
        return this.criarDiaTipo3(tempoIteracao, iteracao);
    },
    criarDiaTipo1: function(tempoIteracao, iteracao) {
        var dia = this.criarDia(tempoIteracao);
        var isTipo3 = iteracao.materias_por_dia != 0;
        if (isTipo3) {
            iteracao.padrao = arredondarParaCima(dia.restante / iteracao.materias_por_dia);
        }
        while (dia.restante > 0) {
            var periodo = new Periodo();
            if (iteracao.sobra == 0) {
                materia = this.obterProximaMateria();
                if (iteracao.variavel) iteracao.padrao = materia.minutos_ciclo;
                if (dia.restante >= iteracao.padrao) {
                    iteracao.minutos = iteracao.padrao;
                } else {
                    iteracao.minutos = dia.restante;
                    iteracao.sobra += iteracao.padrao - dia.restante;
                }
            } else {
                if (materia.restante == 0) {
                    materia = this.obterProximaMateria();
                    if (dia.restante < 60) {
                        var zeradas = true;
                        for (m in materias) {
                            if (materias[m].restante != 0) {
                                zeradas = false;
                                break;
                            }
                        }
                        if (zeradas) {
                            materia.restante = dia.restante;
                        }
                    }
                    if (iteracao.variavel) iteracao.padrao = materia.minutos_ciclo;
                }
                if (dia.restante >= iteracao.sobra) {
                    iteracao.minutos = iteracao.sobra;
                    iteracao.sobra = 0;
                } else {
                    iteracao.minutos = dia.restante;
                    iteracao.sobra = iteracao.sobra - dia.restante;
                }
            }
            if (materia.restante >= iteracao.minutos) {
                periodo.minutos = iteracao.minutos;
            } else {
                if (isTipo3) {
                    periodo.minutos = iteracao.minutos;
                    materia.restante = periodo.minutos;
                } else {
                    periodo.minutos = materia.restante;
                    if (materia.restante > periodo.minutos) {
                        iteracao.sobra += iteracao.minutos - materia.restante;
                    }
                }
            }
            if (periodo.minutos > 0) {
                materia.restante -= periodo.minutos;
                materia.minutos_planejados += periodo.minutos;
                dia.restante -= periodo.minutos;
                var periodoRepetido = this.obterPeriodoRepetido(dia, materia.indice);
                if (periodoRepetido) {
                    periodoRepetido.minutos = periodoRepetido.minutos + periodo.minutos;
                } else {
                    periodo.materia = materia;
                    dia.adicionarPeriodo(periodo);
                }
            }
        }
        return dia;
    },
    criarDiaTipo2: function(tempoIteracao, iteracao) {
        return this.criarDiaTipo1(tempoIteracao, iteracao);
    },
    criarDiaTipo3: function(tempoIteracao, iteracao) {
        var dia = this.criarDia(tempoIteracao);
        while (dia.restante > 0) {
            var periodo = new Periodo();
            if (materia == null || materia.restante <= 0) {
                materia = grade.obterProximaMateria();
            }
            if (iteracao.sobra != 0) {
                periodo.minutos = iteracao.sobra;
                iteracao.sobra = 0;
            } else {
                if (materia.restante >= dia.restante) {
                    periodo.minutos = dia.restante;
                } else {
                    periodo.minutos = materia.restante;
                    iteracao.sobra = dia.restante - materia.restante;
                }
            }
            if (periodo.minutos > 0) {
                materia.restante -= periodo.minutos;
                materia.minutos_planejados += periodo.minutos;
                dia.restante -= periodo.minutos;
                periodo.materia = materia;
                dia.adicionarPeriodo(periodo);
            }
        }
        return dia;
    },
    obterPeriodoRepetido: function(dia, indice) {
        var periodoRepetido = null;
        if (dia.periodos.length) {
            var prd = dia.periodos;
            for (var p in prd) {
                if (prd[p].materia.indice == materia.indice) {
                    periodoRepetido = prd[p];
                    break;
                }
            }
        }
        return periodoRepetido;
    },
    criarDia: function(tempoIteracao) {
        var data = new Date(tempoIteracao);
        var dia = new Dia();
        dia.data = data.obterString();
        dia.dia_semana = diasSemanaMin[data.getDay()];
        dia.restante = minutos_dias[data.getDay()];
        return dia;
    },
    serializarDias: function() {
        for (var i in this.dias) {
            delete this.dias[i].dia_semana;
            delete this.dias[i].restante;
            for (var j in this.dias[i].periodos) {
                var periodo = this.dias[i].periodos[j];
                periodo.materia = {
                    indice: periodo.materia.indice
                };
            }
        }
        for (var i in materias) {
            delete materias[i].restante;
            delete materias[i].minutos_divisao;
            delete materias[i].nome;
        }
        $('#materias-json').val(JSON.stringify(materias));
        $('#dias-json').val(JSON.stringify(this.dias));
    },
    setarDescritor: function(tipoGrade, descritorGrade) {
        if (tipoGrade == 2) {
            this.descritorDias.setar(descritorGrade);
        } else {
            this.descritorDias.desabilitar();
        }
    },
    descritorDias: {
        habilitar: function() {
            $('#descritor-dias').removeAttr('disabled');
        },
        desabilitar: function() {
            $('#descritor-dias').attr('disabled', 'disabled');
        },
        atualizar: function() {
            grade.descritorDias.habilitar();
            $('#Planejamento_descritor_grade').val($('#descritor-dias').val());
        },
        setar: function(descritorGrade) {
            $('#descritor-dias').val(descritorGrade);
        }
    },
    desenharTabela: function() {
        $('#grade-estudos').html('');
        var divLinhaDias = $('<div class="linha-dias">');
        var ultimoDia = this.dias.length - 1;
        for (i in this.dias) {
            var dia = this.dias[i];
            var periodos = dia['periodos'];
            var divDia = $('<div class="dia">');
            divDia.append($('<div class="cabecalho"><span>Dia ' + (converterStringEmNumero(i) + 1) + ':</span> ' + dia.data + ' (' + dia.dia_semana + ')</div>'));
            for (j in periodos) {
                var periodo = periodos[j];
                var divPeriodo = $('<div class="periodo">').append($('<span class="mat-nome">' + (periodo.materia.nome) + '</span>').attr('title', periodo.materia.nome)).append($('<strong>' + obterHoras(periodo.minutos) + '</srong>'));
                divDia.append(divPeriodo);
            }
            divLinhaDias.append(divDia);
            var indice = converterStringEmNumero(i) + 1;
            if ((indice !== 0 && indice % 5 == 0) || i == ultimoDia) {
                $('#grade-estudos').append(divLinhaDias);
                divLinhaDias = $('<div class="linha-dias">');
            }
        }
    },
    salvar: function() {
        grade.serializarDias();
        $('<span>Aguarde...<span/>').insertAfter($('.botao.confirmar'));
        $('input[type=submit]').attr('disabled', 'disabled');
        $('<input type="hidden" name="salvar">').appendTo($('#planejamento-passo4-form'));
        $('#planejamento-passo4-form').submit();
    }
};

function Dia() {
    this.data;
    this.periodos = [];
    this.adicionarPeriodo = function(periodo) {
        this.periodos.push(periodo);
    };
}

function Periodo() {
    this.minutos;
    this.materia;
}

function converterDataEmString(data) {
    return (data.getDate() < 10 ? '0' : '') + data.getDate() + '/' +
        (data.getMonth() < 9 ? '0' : '') + (data.getMonth() + 1) + '/' +
        data.getFullYear();
}

function converterStringEmDataMils(string) {
    var dia = parseInt(string.substring(0, 2), 10);
    var mes = parseInt(string.substring(3, 5), 10);
    var ano = parseInt(string.substring(6, 10), 10);
    return new Date(ano, mes - 1, dia).getTime();
}

function converterStringEmNumero(string) {
    return (string == '' ? 0 : parseInt(string, 10));
}

function obterHoras(minutos) {
    var stringHorasEMinutos;
    if (minutos >= 60) {
        var horas = Math.floor(minutos / 60);
        var mnts = minutos - (horas * 60);
        stringHorasEMinutos = horas + 'h';
        if (mnts != 0) {
            stringHorasEMinutos += mnts + 'm';
        }
    } else {
        stringHorasEMinutos = minutos + 'm';
    }
    return stringHorasEMinutos;
}

function completarComZero(numero) {
    return (numero.toString().length == 1 ? '0' + numero : numero);
}

function obterDiasEntreDatas(data1, data2) {
    return Math.floor((data2.getTime() - data1.getTime()) / tempo.MILISEGUNDOS_UM_DIA);
}

function arredondarPraCimaCinco(numero) {
    return arredondarParaCima(numero, 5);
}

function arredondarPraCimaTrinta(numero) {
    return arredondarParaCima(numero, 30);
}

function arredondarParaCima(numero, divisor) {
    divisor = divisor || 1;
    return Math.ceil(numero / divisor) * divisor;
}

function adicionarDiasMils(mils, dias) {
    var dta = new Date(mils);
    var diaAntigo = dta.getDate();
    var novaData = new Date(dta.getFullYear(), dta.getMonth(), dta.getDate() + dias);
    var diaNovo = novaData.getDate();
    if (diaNovo === diaAntigo) {
        novaData.setDate(diaNovo + 1);
    }
    return novaData.getTime();
}
String.prototype.obterData = function() {
    var dia = parseInt(this.substring(0, 2), 10);
    var mes = parseInt(this.substring(3, 5), 10);
    var ano = parseInt(this.substring(6, 10), 10);
    return new Date(ano, mes - 1, dia);
};
String.prototype.removerAcentos = function() {
    var mapaDeAcentos = {
        'á': 'a',
        'ã': 'a',
        'â': 'a',
        'é': 'e',
        'ê': 'e',
        'í': 'i',
        'õ': 'o',
        'ô': 'o',
        'ó': 'o',
        'ú': 'u',
        'ç': 'c'
    };
    var ret = '';
    for (var i = 0; i < this.length; i++) {
        ret += mapaDeAcentos[this.charAt(i)] || this.charAt(i);
    }
    return ret;
};
Date.prototype.obterString = function(espacador) {
    espacador = espacador || '/';
    return (this.getDate() < 10 ? '0' : '') + this.getDate() + espacador +
        (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1) + espacador +
        this.getFullYear();
};
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
        'use strict';
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}