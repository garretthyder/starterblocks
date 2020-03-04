const { Component, useState } = wp.element;
const { compose, withState } = wp.compose;
const { withDispatch, withSelect, select } = wp.data;
const { Spinner } = wp.components;


import { Modal, ModalManager } from '../ModalManager'
import SingleItem from '../components/SingleItem'
import MultipleItem from '../components/MultipleItem'

import { SingleItemProvider } from '../contexts/SingleItemContext';

import SitePreviewCustomizer from '../SitePreview/SitePreviewCustomizer';

function TemplateList(props) {
    const { pageData, loading, activeItemType, activeCollection } = props;
    const { insertBlocks, setActiveCollection} = props;

    const getBackgroundImage = (url) => {
        if (!url) {
            return starterblocks_admin.plugin + 'assets/img/starterblocks-medium.jpg';
        }
        return url;
    }

    const onSelectCollection = (collectionID) => {
        setActiveCollection(collectionID);
    }

    let types = starterblocks_admin.mokama ? 'active' : 'inactive';
    // Render Part
    if (!loading)
        return (
            <div id="modalContainer" className="starterblocks-template-list-modal">
                <div className="starterblocks-builder-template-list-container">
                    
                    <div id="collections-sections-list" className="starterblocks-builder-page-templates">
                        { pageData &&
                            pageData.map((data, index) => (
                                <div className="starterblocks-pagelist-column">
                                    {
                                        (activeItemType !== 'collection' || activeCollection !== null) ?
                                            <SingleItemProvider value={{
                                                data,
                                                pageData,
                                                index,
                                                activeItemType,
                                                spinner: false
                                            }}>
                                                <SingleItem
                                                    key={index}
                                                    backgroundImage={(data) => getBackgroundImage(data)}                                                   
                                                />
                                            </SingleItemProvider>
                                        :
                                            <MultipleItem
                                                key={index}
                                                data={data}
                                                index={index}
                                                types={types}
                                                itemType={activeItemType}
                                                spinner={false}
                                                onSelectCollection={onSelectCollection}
                                                backgroundImage={getBackgroundImage.bind(data)}
                                            />
                                    }
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    else
        return (
            <div>
                <div style={{ height: "600px" }}>
                    <div className="starterblocks-modal-loader">
                        <Spinner />
                    </div>
                </div>
            </div>
        ); 
}


export default compose([
    withDispatch((dispatch) => {
        const {
            setActiveCollection
        } = dispatch('starterblocks/sectionslist');

        const {
            insertBlocks
        } = dispatch('core/block-editor');
        
        return {
            insertBlocks,
            setActiveCollection
        };
    }),

    withSelect((select, props) => {
        const { getPageData, getLoading, getActiveItemType, getActiveCollection} = select('starterblocks/sectionslist');
        return { pageData: getPageData(), loading: getLoading(), activeItemType: getActiveItemType(), activeCollection: getActiveCollection() };
    })
])(TemplateList);