import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import LuaIcon from './icon--generate-Lua.svg';
import styles from './generate-Lua.css';
import {fileWriter, fileReader} from './sortCode.jsx';
import ScratchBlocks from 'scratch-blocks';

const GenerateLuaComponent = function (props) {
    const {
        active,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <img
            className={classNames(
                className,
                styles.generateLua,
                {
                    [styles.isActive]: active
                }
            )}
            draggable={false}
            src={LuaIcon}
            title={title}
            onClick={onClick}
            {...componentProps}
        />
    );
};

GenerateLuaComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};

GenerateLuaComponent.defaultProps = {
    active: false,
    title: 'Lua'
};

export default GenerateLuaComponent;
