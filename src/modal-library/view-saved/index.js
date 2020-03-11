const {apiFetch} = wp;
const {Component, useState, useEffect} = wp.element;
const {compose} = wp.compose;
const {withDispatch} = wp.data;
const {parse} = wp.blocks
const {__} = wp.i18n;

import './style.scss'

import {Modal, ModalManager} from '../../modal-manager'
import reject from 'lodash/reject';

function SavedView(props) {
    const {insertBlocks, removeBlock, discardAllErrorMessages, appendErrorMessage} = props;
    const [savedSections, setSavedSections] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    if (dataLoaded === false) {
        // Initial fetch
        apiFetch({path: 'starterblocks/v1/get_saved_blocks'}).then(response => {
            setDataLoaded(true);
            if (response.success) {
                setSavedSections(response.data);
            } else {
                appendErrorMessage(response.data.error);
            }
        }).catch(error => {
            appendErrorMessage(error.code + ' : ' + error.message);
        });
    }

    // To display into columns, map data into column-friendly data
    const mapToColumnData = (data, n = 4, balanced = true) => {
        let out = [], i;

        for (i = 0; i < n; i++) out[i] = [];
        data.forEach((section, i) => {
            out[i % n].push(section);
        });
        return out;
    }

    // saved block import is special
    const importSections = (rawData) => {
        let pageData = parse(rawData);
        insertBlocks(pageData);
        ModalManager.close(); //close modal
    }

    const deleteSavedSection = (event, sectionID) => {
        event.stopPropagation();
        discardAllErrorMessages();
        const options = {
            method: 'POST',
            path: 'starterblocks/v1/delete_saved_block/?block_id=' + sectionID,
            headers: {'Content-Type': 'application/json'}
        }
        apiFetch(options).then(response => {
            if (response.success) {
                // on successful remove, we will update the blocks as well.
                setSavedSections(reject(savedSections, {'ID': sectionID}));
            } else {
                appendErrorMessage(response.data.error);
            }
        }).catch(error => {
            appendErrorMessage(error.code + ' : ' + error.message);
        });
    }

    return (
        <div className="starter-two-sections__grid">
            {
                (savedSections && savedSections.length > 0) ?
                    mapToColumnData(savedSections).map(column => {
                        let sections = column.map(section => {
                            return (
                                <div className="starter-two-section"
                                     onClick={() => importSections(section.post_content)}>
                                    <div className="preview-image-wrapper">
                                        <img src="https://brizy.b-cdn.net/screenshot/930493?t=1582105511982"
                                             alt="lazyLoad Image"/>
                                    </div>
                                    <div className="saved-section-title">
                                        {section.post_title}
                                    </div>
                                    <div className="starter-two-section-remove"
                                         onClick={e => deleteSavedSection(e, section.ID)}>
                                        <i className="fas fa-trash"></i>
                                    </div>
                                </div>
                            );
                        })

                        return (
                            <div className="starter-two-sections__grid__column"
                                 style={{width: '25%', flexBasis: '25%'}}>
                                {sections}
                            </div>
                        );
                    })
                    :
                    <div className="no-section">
                        Nothing here yet, make a reusuable block first.
                    </div>
            }
        </div>
    );
}

export default compose([
    withDispatch((dispatch) => {
        const {
            insertBlocks,
            removeBlock
        } = dispatch('core/block-editor');

        const {
            appendErrorMessage,
            discardAllErrorMessages
        } = dispatch('starterblocks/sectionslist');

        return {
            insertBlocks,
            removeBlock,
            appendErrorMessage,
            discardAllErrorMessages
        };
    })
])(SavedView);