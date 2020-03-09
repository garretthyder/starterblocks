const { compose } = wp.compose;
const { withDispatch, withSelect } = wp.data;
const { Component, useState } = wp.element
const { Spinner } = wp.components;
const { apiFetch } = wp;
const { __ } = wp.i18n
import SitePreviewSidebar from './SitePreviewSidebar';
import { ModalManager } from '../modal-manager'
import ImportWizard from '../import-wizard';
import dependencyHelper from '../import-wizard/dependencyHelper';
import uniq from 'lodash/uniq';
import './style.scss';
import { Fragment } from 'react';

function PreviewTemplate(props) {

    const { startIndex, currentPageData } = props;
    const { insertBlocks, discardAllErrorMessages, appendErrorMessage, activeItemType, savePost} = props;
    const [ currentIndex, setCurrentIndex ] = useState(startIndex);
    const [ previewClass, setPreviewClass ] = useState('preview-desktop')
    const [ expandedClass, toggleExpanded ] = useState('expanded')
    const [ importingBlock, setImportingBlock ] = useState(null);
    const [missingPluginArray, setMissingPlugin] = useState([]);
    const [missingProArray, setMissingPro] = useState([]);


    const onCloseCustomizer = () => {
        ModalManager.closeCustomizer();
    }

    const onNextBlock = () => {
        if (currentIndex < currentPageData.length) setCurrentIndex(currentIndex + 1);
    }

    const onPrevBlock = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    }


    const importStarterBlock = () => {
        const type = activeItemType === 'section' ? 'section' : 'page';
        const dependencies = dependencyHelper.checkTemplateDependencies(itemData);
        setMissingPlugin(dependencies.missingPluginArray);
        setMissingPro(dependencies.missingProArray);
        setImportingBlock(itemData);
    }

    const processImport = () => {
        discardAllErrorMessages();
        const type = activeItemType === 'section' ? 'section' : 'page';
        let the_url = 'starterblocks/v1/template?type='+type+'&id=' + itemData.ID;
        if (itemData.source_id) {
            the_url += '&sid=' + itemData.source_id + '&source=' + itemData.source;
        }
        the_url += '&p=' + JSON.stringify(starterblocks.supported_plugins);

        const options = {
            method: 'GET',
            path: the_url,
            headers: { 'Content-Type': 'application/json' }
        }
        apiFetch(options).then(response => {
            if (response.success && response.data.template) {
                //import collection
                let pageData = parse(response.data.template);
                doImportTemplate(pageData);
                savePost().then(() => {
                    if (missingPluginArray.length > 0)
                        setTimeout(window.location.reload(), 1000);
                });
            } else {
                appendErrorMessage(response.data.error);
            }
        }).catch(error => {
            appendErrorMessage(error.code + ' : ' + error.message);
        });
    }

    let wrapperClassName = ['wp-full-overlay sites-preview theme-install-overlay ', previewClass, expandedClass].join(' ');
    let itemData = currentPageData[currentIndex];
    return (
        <Fragment>
            <div className={wrapperClassName} style={{display: 'block'}}>
                <SitePreviewSidebar itemData={itemData} previewClass={previewClass} expandedClass={expandedClass}
                    onNextBlock={onNextBlock} onPrevBlock={onPrevBlock}
                    onCloseCustomizer={onCloseCustomizer} onToggleExpanded={e => toggleExpanded(e)}
                    onImport={importStarterBlock}
                    onChangePreviewClass={e => setPreviewClass(e)} />
                <div className='wp-full-overlay-main'>
                    <iframe src={itemData.url} target='Preview'></iframe>
                </div>
            </div>
            { importingBlock && <ImportWizard missingPlugins={uniq(missingPluginArray)} missingPros={uniq(missingProArray)}
                startImportTemplate={processImport} closeWizard={() => setImportingBlock(null)} /> }
        </Fragment>
    );
}

export default compose([
    withDispatch((dispatch) => {
        const {
            insertBlocks
        } = dispatch('core/block-editor');

        const {
            appendErrorMessage,
            discardAllErrorMessages
        } = dispatch('starterblocks/sectionslist');

		const {savePost} = dispatch('core/editor');

        return {
            insertBlocks,
            appendErrorMessage,
            discardAllErrorMessages,
            savePost
        };
    }),

    withSelect((select, props) => {
        const { getActiveItemType } = select('starterblocks/sectionslist');
        return { activeItemType: getActiveItemType() };
    })
])(PreviewTemplate);