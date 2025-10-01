import React, { useState, useCallback, useRef } from "react";
import { Query, Builder, Utils, BuilderProps, ImmutableTree, Config, ActionMeta, Actions } from "@react-awesome-query-builder/ui";
import throttle from "lodash/throttle";
import merge from "lodash/merge";
import { ImportSkinStyles } from "../skins";
import loadConfig from "./config";
import { initTreeWithValidation, dispatchHmrUpdate, useHmrUpdate } from "./utils";
import type { DemoQueryBuilderState, DemoQueryBuilderMemo } from "./types";
import { defaultInitFile, initialSkin, validationTranslateOptions, defaultRenderBlocks } from "./options";
import type { LazyStyleModule } from "../skins";
import "./i18n";

// @ts-ignore
import mainStyles from "../styles.scss";
(mainStyles as LazyStyleModule).use();


const loadedConfig = merge(loadConfig(window._initialSkin || initialSkin), window._configChanges ?? {});
const { tree: initTree, errors: initErrors } = initTreeWithValidation(window._initFile || defaultInitFile, loadedConfig, validationTranslateOptions);


dispatchHmrUpdate(loadedConfig, initTree);

const DemoQueryBuilder: React.FC = () => {
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = useRef({});

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree,
    initErrors: initErrors,
    config: loadedConfig,
    skin: initialSkin,
    spelStr: "",
    sqlStr: "",
    spelErrors: [] as Array<string>,
    sqlErrors: [] as Array<string>,
    sqlWarnings: [] as Array<string>,
    jsonLogicStr: "",
    jsonLogicErrors: [] as Array<string>,
    isJsonEditorOpen: false,
    renderBocks: defaultRenderBlocks,
    initFile: defaultInitFile,
    themeMode: "light", //"auto",
    useOldDesign: false,
    isBodyDark: false,
    renderSize: "small",
    compactMode: false,
    liteMode: true,
    configChanges: {},
  });

  // Trick for HMR
  useHmrUpdate(useCallback(({ config }) => {
    setState(state => ({ ...state, config }));
  }, []));


  const renderBuilder = useCallback((bprops: BuilderProps) => {
    return (
      <div className="query-builder-container" style={{ padding: "10px" }}>
        <div className="query-builder">
          <Builder {...bprops} />
        </div>
      </div>
    );
  }, []);

  const onChange = useCallback((immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta, actions?: Actions) => {
    if (actionMeta && state.renderBocks.actions) {
      console.info(actionMeta);
    }
    memo.current.immutableTree = immutableTree;
    memo.current.config = config;
    memo.current.actions = actions;
    updateResult();
  }, [state.renderBocks]);

  const updateResult = throttle(() => {
    setState(prevState => {
      const tree = memo.current.immutableTree!;
      const config = Utils.ConfigUtils.areConfigsSame(memo.current.config, prevState.config) ? prevState.config : memo.current.config;
      return {
        ...prevState,
        tree,
        config,
      };
    });
  }, 100);



  const builder = state.renderBocks.queryBuilder && (
    <Query
      {...state.config}
      value={state.tree}
      onInit={onChange}
      onChange={onChange}
      renderBuilder={renderBuilder}
    />
  );

  return (
    <div>
      <ImportSkinStyles skin={state.skin} />
      {builder}
    </div>
  );
};


export default DemoQueryBuilder;
