const {Component, useState, useEffect, Fragment} = wp.element;
const {compose, withState} = wp.compose;
const {withDispatch, withSelect, select} = wp.data;

import './style.scss';

import {columnMap, pageSizeMap} from '../../stores/helper';

function Pagination(props) {
    const {currentPage, pageData, columns} = props;
    const {setCurrentPage} = props;
    const [totalPages, setTotalPages] = useState(1);
    const [firstButtonClass, setFirstButtonClass] = useState('tablenav-pages-navspan button');
    const [prevButtonClass, setPrevButtonClass] = useState('tablenav-pages-navspan button');
    const [nextButtonClass, setNextButtonClass] = useState('tablenav-pages-navspan button');
    const [lastButtonClass, setLastButtonClass] = useState('tablenav-pages-navspan button');

    useEffect(() => {
        const enabledClassname = 'tablenav-pages-navspan button ';
        const disabledClassname = 'tablenav-pages-navspan button disabled';
        setFirstButtonClass((currentPage === 0) ? disabledClassname : enabledClassname);
        setPrevButtonClass((currentPage === 0) ? disabledClassname : enabledClassname);
        setNextButtonClass((currentPage === totalPages - 1) ? disabledClassname : enabledClassname);
        setLastButtonClass((currentPage === totalPages - 1) ? disabledClassname : enabledClassname);
    }, [currentPage, totalPages]);

    useEffect(() => {
        let colStr = (columns === '') ? 'medium' : columns;
        setTotalPages(Math.ceil(pageData.length / pageSizeMap[colStr]));
    }, [pageData]);

    const gotoPage = (pageNum, className) => {
        if (className.indexOf('disabled') > 0) return;
        document.getElementById('modalContent').scrollTop = 0;
        setCurrentPage(pageNum);
    }


    return (
        <Fragment>

            {
                totalPages > 0 &&
                <div className="tablenav-pages">
                    <span className="displaying-num">{pageData.length} items</span>
                    <span className="pagination-links">
                        <span className={firstButtonClass} aria-hidden="true"
                            onClick={() => gotoPage(0, firstButtonClass)}>«</span>
                        <span className={prevButtonClass} aria-hidden="true"
                            onClick={() => gotoPage(currentPage - 1, prevButtonClass)}>‹</span>
                        <span className="screen-reader-text">Current Page</span>
                        <span id="table-paging" className="paging-input">
                            <span className="tablenav-paging-text">{currentPage + 1} of <span
                                className="total-pages">{totalPages}</span></span>
                        </span>
                        <span className={nextButtonClass} aria-hidden="true"
                            onClick={() => gotoPage(currentPage + 1, nextButtonClass)}>›</span>
                        <span className={lastButtonClass} aria-hidden="true"
                            onClick={() => gotoPage(totalPages - 1, lastButtonClass)}>»</span>
                    </span>
                </div>
            }
        </Fragment>
    );
}


export default compose([
    withDispatch((dispatch) => {
        const {
            setCurrentPage
        } = dispatch('starterblocks/sectionslist');

        return {
            setCurrentPage
        };
    }),

    withSelect((select, props) => {
        const {getCurrentPage, getPageData, getColumns} = select('starterblocks/sectionslist');
        return {
            currentPage: getCurrentPage(),
            pageData: getPageData(),
            columns: getColumns()
        };
    })
])(Pagination);
