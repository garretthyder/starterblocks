const {apiFetch} = wp;
const {parse} = wp.blocks;
const {compose} = wp.compose;
const {withDispatch, withSelect, select, subscribe} = wp.data;
const {Component, Fragment, useState, useRef} = wp.element;
const {Spinner} = wp.components;
const {isSavingPost} = select('core/editor');

import '../stores';

import {TemplateModalProvider} from '../contexts/TemplateModalContext';
import {Modal, ModalManager} from '../modal-manager'
import TabHeader from '../components/tab-header';
import WithSidebarLayout from './layout-with-sidebar';
import CollectionView from './view-collection';
import SavedView from './view-saved';
import PreviewModal from '../modal-preview';
import ImportWizard from '../modal-import-wizard';
import ErrorNotice from '../components/error-notice';
import {processImportHelper} from '~starterblocks/stores/helper';
import dependencyHelper from '../modal-import-wizard/dependencyHelper';
import uniq from 'lodash/uniq';
import './style.scss'

function LibraryModal(props) {
	const {
		fetchLibraryFromAPI, activeCollection, activeItemType, errorMessages,
		appendErrorMessage, discardAllErrorMessages, blockTypes, inserterItems, categories, savePost, isSavingPost
	} = props;
	const [spinner, setSpinner] = useState(null);
	const [saving, setSaving] = useState(false);
	const [importingBlock, setImportingBlock] = useState(null);
	const [missingPluginArray, setMissingPlugin] = useState([]);
	const [missingProArray, setMissingPro] = useState([]);
	const wasSaving = useRef(false);

	fetchLibraryFromAPI();

	const hasSidebar = () => {
		return ((activeItemType !== 'collection' || activeCollection === null) && activeItemType !== 'saved');
	}


	const onImportTemplate = (data) => {
		importStarterBlock(data, activeItemType === 'section' ? 'sections' : 'pages');
	}

	const importStarterBlock = (data, type) => {
		const dependencies = dependencyHelper.checkTemplateDependencies(data);
		setMissingPlugin(dependencies.missingPluginArray);
		setMissingPro(dependencies.missingProArray);
		setImportingBlock(data);
	}

	const useDidSave = () => {
		const hasJustSaved = wasSaving.current && !isSavingPost;
		wasSaving.current = isSavingPost;
		return hasJustSaved;
	}

	// read block data to import and give the control to actual import
	const processImport = () => {
		discardAllErrorMessages();
		setSpinner(null);
		processImportHelper(importingBlock, activeItemType === 'section' ? 'sections' : 'pages', registerError)
	}


	const registerError = (errorMessage) => {
		appendErrorMessage(errorMessage);
		setSpinner(null);
	}

	// Open Site Preview Modal
	const openSitePreviewModal = (index, item) => {
		ModalManager.openCustomizer(<PreviewModal startIndex={index} currentPageData={item}/>);
	}
	return (
		<Modal className="starterblocks-builder-modal-pages-list"
			   customClass="starterblocks-builder-modal-template-list"
			   openTimeoutMS={0} closeTimeoutMS={0}>
			<TabHeader/>
			<TemplateModalProvider value={{
				openSitePreviewModal,
				onImportTemplate,
				spinner
			}}>
				{
					errorMessages && errorMessages.length > 0 &&
					<ErrorNotice discardAllErrorMessages={discardAllErrorMessages} errorMessages={errorMessages}/>
				}
				<div className="starterblocks-collections-modal-body">
					{hasSidebar() && <WithSidebarLayout/>}
					{(hasSidebar() === false && activeItemType === 'collection') && <CollectionView/>}
					{(hasSidebar() === false && activeItemType !== 'collection') && <SavedView/>}
				</div>
				{importingBlock &&
				<ImportWizard missingPlugins={uniq(missingPluginArray)} missingPros={uniq(missingProArray)}
							  startImportTemplate={processImport} closeWizard={() => setImportingBlock(null)}/>}
			</TemplateModalProvider>
		</Modal>
	);
}


export default compose([
	withDispatch((dispatch) => {
		const {
			appendErrorMessage,
			discardAllErrorMessages
		} = dispatch('starterblocks/sectionslist');

		const {savePost} = dispatch('core/editor');

		return {
			appendErrorMessage,
			discardAllErrorMessages,
			savePost
		};
	}),

	withSelect((select, props) => {
		const {fetchLibraryFromAPI, getActiveCollection, getActiveItemType, getErrorMessages} = select('starterblocks/sectionslist');
		const {isSavingPost} = select('core/editor')
		return {
			fetchLibraryFromAPI,
			activeCollection: getActiveCollection(),
			activeItemType: getActiveItemType(),
			errorMessages: getErrorMessages(),
			isSavingPost: isSavingPost()
		};
	})
])(LibraryModal);