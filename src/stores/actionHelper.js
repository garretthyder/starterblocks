const {parse, createBlock} = wp.blocks;
const {apiFetch} = wp;
const {dispatch, select, useDispatch} = wp.data;
const {getBlockTypes} = dispatch('core/blocks');
const {savePost} = dispatch('core/editor');
const {insertBlocks} = dispatch('core/editor');
const {switchEditorMode} = dispatch('core/edit-post');

const {createSuccessNotice, createErrorNotice} = dispatch('core/notices');
import {ModalManager} from '~starterblocks/modal-manager';
import PreviewModal from '../modal-preview';

// create Block to import template
export const handleBlock = (data, installedDependencies) => {
    let block_data = null;
    if ('template' in data) {
        block_data = parse(data.template);
    } else if ('attributes' in data) {
        if (!('innerBlocks' in data)) {
            data.innerBlocks = [];
        }
        if (!('name' in data)) {
            errorCallback('Template malformed, `name` for block not specified.');
        }
        // This kind of plugins are not ready to accept before reloading, thus, we save it into localStorage and just reload for now.
        if (installedDependencies === true) {
            window.starterblocks_tempdata = [...window.starterblocks_tempdata, data];
            return null;
        } else {
            block_data = createBlock(data.name, data.attributes, data.innerBlocks)
        }
    } else {
        errorCallback('Template error. Please try again.');
    }
    return block_data;
}

export const processImportHelper = () => {
    const {setImportingTemplate, discardAllErrorMessages} = dispatch('starterblocks/sectionslist');
    const type = select('starterblocks/sectionslist').getActiveItemType() === 'section' ? 'sections' : 'pages';
    const data = select('starterblocks/sectionslist').getImportingTemplate();
    const installedDependencies = select('starterblocks/sectionslist').getInstalledDependencies();

    discardAllErrorMessages();
    let the_url = 'starterblocks/v1/template?type=' + type + '&id=' + data.id;
    if ('source' in data) {
        the_url += '&source=' + data.source;
    }

    const options = {
        method: 'GET',
        path: the_url,
        headers: {'Content-Type': 'application/json', 'Registered-Blocks': installedBlocksTypes()}
    };

    if (select('core/edit-post').getEditorMode() === 'text') {
        switchEditorMode()
    }
    window.starterblocks_tempdata = [];

    apiFetch(options).then(response => {
        if (response.success && response.data) {
            let responseBlockData = response.data;
            let handledData = [];
            if (responseBlockData.hasOwnProperty('template') || responseBlockData.hasOwnProperty('attributes'))
                handledData = handleBlock(responseBlockData, installedDependencies);
            else
                handledData = Object.keys(responseBlockData).filter(key => key!=='cache')
                    .map(key => handleBlock(responseBlockData[key], installedDependencies));

            localStorage.setItem('block_data', JSON.stringify(starterblocks_tempdata));
            insertBlocks(handledData);
            createSuccessNotice('Template inserted', {type: 'snackbar'});
            if (installedDependencies === true)
                savePost()
                    .then(() => window.location.reload())
                    .catch(() => createErrorNotice('Error while saving the post', {type: 'snackbar'}));
            else {
                ModalManager.close();
                ModalManager.closeCustomizer();
                setImportingTemplate(null);
            }
        } else {
            errorCallback(response.data.error);
        }
    }).catch(error => {
        errorCallback(error.code + ' : ' + error.message);
    });
}

// reload library button handler
export const reloadLibrary = () => {
    const { setLoading, setLibrary } = dispatch('starterblocks/sectionslist');
    setLoading(true);
    apiFetch({
        path: 'starterblocks/v1/library?no_cache=1',
        method: 'POST',
        data: {
            'registered_blocks': installedBlocksTypes(),
        }
    }).then((newLibrary) => {
        setLoading(false);
        setLibrary(newLibrary.data);
    }).catch((error) => {
        errorCallback(error);
    });
}


export const installedBlocks = () => {
    let installed_blocks = select('core/blocks').getBlockTypes();
    return Object.keys(installed_blocks).map(key => {
        return installed_blocks[key]['name'];
    })
}
export const installedBlocksTypes = () => {
    let installed_blocks = select('core/blocks').getBlockTypes();

    let names = Object.keys(installed_blocks).map(key => {
        if (!installed_blocks[key]['name'].includes('core')) {
            return installed_blocks[key]['name'].split('/')[0];
        }
    })
    let unique = [...new Set(names)];
    var filtered = unique.filter(function (el) {
        return el;
    });

    return filtered
}

export const openSitePreviewModal = (index, pageData) => {
    ModalManager.openCustomizer(
        <PreviewModal startIndex={index} currentPageData={pageData}/>
    )
}

const errorCallback = (errorMessage) => {
    const {appendErrorMessage, setImportingTemplate} = dispatch('starterblocks/sectionslist');
    appendErrorMessage(errorMessage);
    setImportingTemplate(null);
}