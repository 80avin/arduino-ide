import { nls } from '@theia/core/lib/common';
import { shell } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { ProgressInfo, UpdateInfo } from '../../../common/protocol/ide-updater';
import ProgressBar from '../../components/ProgressBar';

export type IDEUpdaterComponentProps = {
  updateInfo: UpdateInfo;
  downloadFinished?: boolean;
  downloadStarted?: boolean;
  progress?: ProgressInfo;
  error?: Error;
  onDownload: () => void;
  onClose: () => void;
  onSkipVersion: () => void;
  onCloseAndInstall: () => void;
};

export const IDEUpdaterComponent = ({
  updateInfo: { version, releaseNotes },
  downloadStarted = false,
  downloadFinished = false,
  progress,
  error,
  onDownload,
  onClose,
  onSkipVersion,
  onCloseAndInstall,
}: IDEUpdaterComponentProps): React.ReactElement => {
  const changelogDivRef = React.useRef() as React.MutableRefObject<
    HTMLDivElement
  >;
  React.useEffect(() => {
    if (!!releaseNotes) {
      let changelog: string;
      if (typeof releaseNotes === 'string') changelog = releaseNotes;
      else
        changelog = releaseNotes.reduce((acc, item) => {
          return item.note ? (acc += `${item.note}\n\n`) : acc;
        }, '');
      ReactDOM.render(
        <ReactMarkdown
          components={{
            a: ({ href, children, ...props }) => (
              <a onClick={() => href && shell.openExternal(href)} {...props}>
                {children}
              </a>
            ),
          }}
        >
          {changelog}
        </ReactMarkdown>,
        changelogDivRef.current
      );
    }
  }, [releaseNotes]);
  const closeButton = (
    <button onClick={onClose} type="button" className="theia-button secondary">
      {nls.localize('arduino/ide-updater/notNowButton', 'Not now')}
    </button>
  );

  return (
    <div className="ide-updater-dialog--content">
      {downloadFinished ? (
        <div className="ide-updater-dialog--downloaded">
          <div>
            {nls.localize(
              'arduino/ide-updater/versionDownloaded',
              'Arduino IDE {0} has been downloaded.',
              version
            )}
          </div>
          <div>
            {nls.localize(
              'arduino/ide-updater/closeToInstallNotice',
              'Close the software and install the update on your machine.'
            )}
          </div>
          <div className="buttons-container">
            {closeButton}
            <button
              onClick={onCloseAndInstall}
              type="button"
              className="theia-button close-and-install"
            >
              {nls.localize(
                'arduino/ide-updater/closeAndInstallButton',
                'Close and Install'
              )}
            </button>
          </div>
        </div>
      ) : downloadStarted ? (
        <div className="ide-updater-dialog--downloading">
          <div>
            {nls.localize(
              'arduino/ide-updater/downloadingNotice',
              'Downloading the latest version of the Arduino IDE.'
            )}
          </div>
          <ProgressBar percent={progress?.percent} showPercentage />
        </div>
      ) : (
        <div className="ide-updater-dialog--pre-download">
          <div className="ide-updater-dialog--logo-container">
            <div className="ide-updater-dialog--logo"></div>
          </div>
          <div className="ide-updater-dialog--new-version-text dialogSection">
            <div className="dialogRow">
              <div className="bold">
                {nls.localize(
                  'arduino/ide-updater/updateAvailable',
                  'Update Available'
                )}
              </div>
            </div>
            <div className="dialogRow">
              {nls.localize(
                'arduino/ide-updater/newVersionAvailable',
                'A new version of Arduino IDE ({0}) is available for download.',
                version
              )}
            </div>
            {releaseNotes && (
              <div className="dialogRow">
                <div className="changelog-container" ref={changelogDivRef} />
              </div>
            )}
            <div className="buttons-container">
              <button
                onClick={onSkipVersion}
                type="button"
                className="theia-button secondary skip-version"
              >
                {nls.localize(
                  'arduino/ide-updater/skipVersionButton',
                  'Skip Version'
                )}
              </button>
              <div className="push"></div>
              {closeButton}
              <button
                onClick={onDownload}
                type="button"
                className="theia-button primary"
              >
                {nls.localize('arduino/ide-updater/downloadButton', 'Download')}
              </button>
            </div>
          </div>
        </div>
      )}
      {!!error && <div className="error-container">{error}</div>}
    </div>
  );
};
