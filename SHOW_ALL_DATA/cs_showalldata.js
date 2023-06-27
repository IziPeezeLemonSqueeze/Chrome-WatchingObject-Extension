
let salesforceBody = document.body;
let isShowAllDataVisible = false;
let jsonText;
let currentLocale =/*  chrome.i18n.getMessage("@@ui_locale") || */ 'en'; // TODO DA SISTEMARE

let lastTimeUpdateData = `${new Date(Date.now()).toLocaleDateString().toString()} - ${new Date(Date.now()).toLocaleTimeString().toString()}`;

const promiseJsonText = fetch(chrome.runtime.getURL('it_en.json'))

promiseJsonText.then(async (val) =>
{
    jsonText = JSON.parse(await val.text());
});

const newTabShowAllData = document.createElement('li');
const flexipageTab = document.createElement('flexipage-tab2');
const divBarTools = document.createElement('div');

let headerBody = document.getElementsByClassName('highlights slds-clearfix slds-page-header slds-page-header_record-home fixed-position')[0] || null;
const btnTopPage = document.createElement('button');
const searchField = document.createElement('input');
const searchFieldHeader = document.createElement('input');


const getTextFromLanguage = (text) =>
{

    console.log(jsonText, text, currentLocale)
    return jsonText[text][currentLocale];
}

const openShowAllData = (entries) =>
{
    headerBody = document.getElementsByClassName('highlights slds-clearfix slds-page-header slds-page-header_record-home fixed-position')[0] || null;
    isShowAllDataVisible = true;
    const tabList = document.getElementsByClassName('slds-tabs_default__nav')[0];

    const tabBodyList = document.getElementsByName('tabs')[0];
    console.log('tabBodyList', tabBodyList);

    newTabShowAllData.className = 'slds-tabs_default__item slds-is-active';
    document.getElementsByClassName('slds-tabs_default__item slds-is-active')[0].className = 'slds-tabs_default__item';

    newTabShowAllData.title = 'SHOW ALL DATA';
    newTabShowAllData.setAttribute('data-label', 'SHOW ALL DATA');
    newTabShowAllData.setAttribute('data-tab-value', 'sadTab');
    newTabShowAllData.setAttribute('data-target-selection-name', 'sadTabTab');

    newTabShowAllData.addEventListener('click', (e) =>
    {
        if (newTabShowAllData.className.includes('slds-tabs_default__item slds-is-active'))
        {
            return;
        } else
        {
            document.getElementsByClassName('slds-tabs_default__item slds-is-active')[0].className = 'slds-tabs_default__item';
            newTabShowAllData.className = 'slds-tabs_default__item slds-is-active';

            document.getElementsByClassName('slds-tabs_default__content slds-show')[0].className = 'slds-tabs_default__content slds-hide';
            flexipageTab.className = 'slds-tabs_default__content slds-show';
        }
    });

    const a = document.createElement('a');
    a.className = "slds-tabs_default__link";
    a.id = "sadTab__item";
    a.setAttribute('data-label', 'Show All Data');
    a.setAttribute('aria-controls', 'tab-0');
    a.setAttribute('aria-selected', 'false');
    a.innerText = 'Show All Data';

    newTabShowAllData.appendChild(a);

    flexipageTab.id = 'tab-0';
    flexipageTab.className = 'slds-tabs_default__content slds-show';
    document.getElementsByClassName('slds-tabs_default__content slds-show')[0].className = 'slds-tabs_default__content slds-hide';

    flexipageTab.setAttribute('aria-labelledby', 'showAllDataTab__item');
    flexipageTab.setAttribute('flexipage-tab2_tab2-host', '');

    const slotTab = document.createElement('slot');
    slotTab.setAttribute('flexipage-tab2_tab2', '');

    const component = document.createElement('flexipage-component2');
    component.setAttribute('data-component-id', 'showalldata_detailPanel');
    component.setAttribute('data-target-selection-name', 'showalldata_detailPanel');
    component.setAttribute('flexipage-component2_component2-host', '');

    divBarTools.style = "width: 95%;display: flex;flex-flow: row nowrap;place-content: center space-between;align-items: center;"

    searchField.className = 'slds-input';
    searchField.placeholder = getTextFromLanguage('showAllDataCampoDiRicerca');
    searchField.style = 'min-width: 20%;max-width: 40%;';
    searchField.id = 'searchSAD';

    searchFieldHeader.className = 'slds-input';
    searchFieldHeader.placeholder = getTextFromLanguage('showAllDataCampoDiRicerca');
    searchFieldHeader.style = 'min-width: 20%;max-width: 40%;';
    searchFieldHeader.id = 'searchSAD-header';

    btnTopPage.innerText = '🔝';
    btnTopPage.style = 'visibility:hidden';
    btnTopPage.className = 'slds-button slds-button_outline-brand';
    btnTopPage.id = 'btnTopSAD';

    btnTopPage.addEventListener('click', (e) =>
    {
        window.scrollTo({
            left: 0,
            behavior: "smooth",
            top: 0
        });
    });

    document.addEventListener('scroll', (e) =>
    {
        if (window.scrollY > 200)
        {

            if (!document.getElementById('btnTopSAD-header'))
            {


                headerBody.appendChild(btnTopPage);
                headerBody.appendChild(searchFieldHeader);
            }
            btnTopPage.style = "z-index: 100;position: absolute; top: 75%; left: 41.5%;visibility: visible;";
            searchField.style = "min-width: 20%;max-width: 40%; visibility: hidden;";
            searchFieldHeader.style = "min-width: 20%;max-width: 40%;z-index: 100;position: absolute; top: 75%; left: 1.5%";
        } else
        {

            btnTopPage.style = "z-index: 100;position: absolute; top: 20%; left: 1.5%;visibility: hidden;";
            searchField.style = "min-width: 20%;max-width: 40%; visibility: visible;";
            searchFieldHeader.style = "min-width: 20%;max-width: 40%; visibility: hidden;";
        }
    })

    const saveEditOnDataBtn = document.createElement('button');
    saveEditOnDataBtn.innerText = getTextFromLanguage('btnSalvaDatiModificati');
    saveEditOnDataBtn.className = "slds-button slds-button_brand";


    const refreshDataBtn = document.createElement('button');
    refreshDataBtn.innerText = getTextFromLanguage('btnAggiornaDati');
    refreshDataBtn.className = "slds-button slds-button_outline-brand";
    refreshDataBtn.style = "margin-left: auto;"

    const lastTimeUpdateSpan = document.createElement('span');

    lastTimeUpdateSpan.innerText = getTextFromLanguage('LabelUltimoAggiornamentoData') + lastTimeUpdateData;
    lastTimeUpdateSpan.style = 'margin-top: 2.5%;font-size: smaller;padding: 0%;';
    lastTimeUpdateSpan.className = "slds-form-element__label";

    divBarTools.appendChild(searchField);
    divBarTools.appendChild(refreshDataBtn);
    divBarTools.appendChild(saveEditOnDataBtn);


    flexipageTab.appendChild(divBarTools);
    flexipageTab.appendChild(lastTimeUpdateSpan);
    component.appendChild(initBodySAD(entries));

    flexipageTab.appendChild(slotTab);
    slotTab.appendChild(component);

    tabList.appendChild(newTabShowAllData);
    tabBodyList.appendChild(flexipageTab);

    for (let item of document.getElementsByClassName('slds-tabs_default__item'))
    {
        if (item.className.includes('active'))
        {
            continue;
        }
        item.addEventListener('click', (e) =>
        {
            console.log(e, 'click another tab')
            newTabShowAllData.className.includes('slds-tabs_default__item slds-is-active') ?
                newTabShowAllData.className = 'slds-tabs_default__item' : null;

            flexipageTab.className.includes('slds-tabs_default__content slds-show') ?
                flexipageTab.className =
                'slds-tabs_default__content slds-hide' : null;
        });
    }







    const addCSS = (css) =>
    {
        let link = document.createElement("link");
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');

        link.href = css

        document.head.appendChild(link);
    }
    addCSS(chrome.runtime.getURL('./SHOW_ALL_DATA/show_all_data.css'));
}

const initBodySAD = (entries) =>
{
    const table = document.createElement('table');
    table.className = "slds-table slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols";
    table.role = 'grid';

    table.setAttribute('aria-labelledby', "element-with-table-label other-element-with-table-label");
    table.setAttribute('aria-multiselectable', "true");

    const COLUMN =
        ['Label', 'Api Name', 'Type', 'Value', ' '];
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    trHead.className = "slds-line-height_reset";

    COLUMN.forEach((col, idx) =>
    {
        const th = document.createElement('th');
        th.setAttribute("aria-sort", "none");
        th.className = "slds-is-resizable slds-is-sortable slds-cell_action-mode";
        th.scope = 'col';
        col == ' ' ? th.style = 'width: 55px;' : null;
        col == 'Type' ? th.style = 'width: 100px;' : null;

        const a = document.createElement('a');
        a.className = 'slds-th__action slds-text-link_reset';
        a.role = 'button';
        a.tabIndex = '0';
        col == ' ' ? null : a.addEventListener('click', (e) =>
        {
            // TODO GESIONE DEL SORTING DELLE COLONNE
        })

        const span = document.createElement('span');
        span.className = 'slds-assistive-text';
        span.innerText = 'Sort by:';

        const divTitleCol = document.createElement('div');
        divTitleCol.className = "slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate";
        divTitleCol.title = col;
        divTitleCol.innerText = col;


        a.appendChild(span);
        a.appendChild(divTitleCol);

        th.appendChild(a);
        trHead.appendChild(th);
        thead.appendChild(trHead);
    });

    const tbody = document.createElement('tbody');

    console.table('entries', entries);
    Object.entries(entries).sort((a, b) =>
    {
        if (a[1].label < b[1].label)
        {
            return - 1;
        }
        if (a[1].label > b[1].label)
        {
            return 1;
        }
        return 0;
    }).forEach(entrie =>
    {
        let tr = document.createElement('tr');
        tr.className = "slds-hint-parent";
        console.log(entrie);
        createBodyElement(tr, entrie);
        tbody.appendChild(tr);
    });

    function createBodyElement(tr, entrie)
    {
        let div;
        COLUMN.forEach(col =>
        {
            switch (col)
            {
                case COLUMN[0]:
                    div = initTDandDIV(entrie[1].label);
                    div.innerText = entrie[1].label;
                    break;
                case COLUMN[1]:
                    div = initTDandDIV(entrie[1].name);
                    div.innerText = entrie[1].name;

                    if (!entrie[1].custom)
                    {
                        div.style = 'color: green;';
                    }
                    break;
                case COLUMN[2]:
                    div = initTDandDIV(entrie[1].type);
                    if (entrie[1].type == 'percent' || entrie[1].type == 'double' || entrie[1].type == 'currency')
                    {
                        div.innerText = `${entrie[1].type}(${entrie[1].precision - entrie[1].scale},${entrie[1].scale})${entrie[1].calculated ? '*' : ''}`;
                    } else if (entrie[1].type == 'id')
                    {
                        div.innerText = `${entrie[1].type}(${entrie[1].length})`;
                    } else if (entrie[1].type == 'string')
                    {
                        div.innerText = `${entrie[1].type}(${entrie[1].length})${entrie[1].calculated ? '*' : ''}`;
                    } else if (entrie[1].type == 'picklist' || entrie[1].type == 'multipicklist')
                    {
                        div.innerText = `${entrie[1].type}`;
                        let pickValues = 'API ~ LABEL:\n';
                        entrie[1].picklistValues.forEach(value =>
                        {
                            pickValues += value.value + ' ~ ' + value.label + '\n';
                        });
                        div.setAttribute('data-tooltip', pickValues);
                    } else if (entrie[1].type == 'boolean')
                    {
                        div.innerText = `${entrie[1].type}${entrie[1].calculated ? '*' : ''}`;
                    } else
                    {
                        div.innerText = `${entrie[1].type}`;
                    }

                    if (entrie[1].calculated)
                    {
                        div.title = entrie[1].calculatedFormula;
                    }
                    break;
                case COLUMN[3]:
                    div = initTDandDIV(entrie[1].value);

                    if (!entrie[1].value)
                    {
                        div.innerText = '<blank>';
                        div.style = 'color: grey';
                    } else if (typeof entrie[1].value === 'object' && entrie[1].value !== null && !Array.isArray(entrie[1].value))
                    {
                        div.innerText = JSON.stringify(entrie[1].value, null, 4);
                    } else
                    {
                        div.innerText = entrie[1].value;
                    }


                    break;
                case COLUMN[4]:
                    let button = document.createElement('button')
                    button.innerText = '✒️';
                    button.className = 'slds-button slds-button_neutral';
                    tr.appendChild(button);
                    break;
            }
        });

        function initTDandDIV(value)
        {
            const td = document.createElement('td');
            td.setAttribute('data-label', value);

            const div = document.createElement('div');
            div.className = "slds-truncate";
            div.title = value;

            td.appendChild(div);
            tr.appendChild(td);

            return div;
        }
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}


chrome.runtime.onMessage.addListener((obj, sender, response) =>
{
    console.log('ARRIVED CS_SHOW_ALL_DATA', obj);
    if (obj.response)
    {
        // GESTIONE RESPONSE FROM BACKGROUND.JS
        switch (obj.response)
        {
            case 'openShowAllData':
                if (!isShowAllDataVisible)
                {
                    openShowAllData(obj.payload);
                }
                break;

        }
    }


});

