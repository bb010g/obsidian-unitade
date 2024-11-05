/*
 * MIT License
 *
 * Copyright (c) 2023-2024
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Any code and/or API associated with OBSIDIAN behaves as stated in their distribution policy.
 */

import {
    Modal,
    ButtonComponent,
    TextComponent,
    Setting,
} from "obsidian";

import UNITADE_PLUGIN from "../../main";

export class TFileCreate extends Modal {
    private _filepath: string;

    private _name: string;

    private _integration: boolean;
    private _integration_code_editor: boolean;

    constructor(
        private plugin: UNITADE_PLUGIN,
        private target: string,
    ) {
        super(plugin.app);

        this._filepath = this.target;

        this._name = '';

        this._integration = false;
        this._integration_code_editor = false;
    }

    onOpen(): void {
        const { contentEl } = this;

        const form = contentEl.createEl("div");
        const disp = contentEl.createEl("span");

        const input = new TextComponent(form);

        contentEl.style.cssText =
            `
            display:          flex;
            align-items:    center;
            flex-direction: column;
            `;
        disp.style.cssText =
            `
            flex-grow:       1;
            font-weight:  bold;
            margin-top:   10px;
            margin-right: 10px;
            margin-bottom: 5px;
            text-align: center;
            `;
        form.style.cssText =
            `
            display:       flex;
            align-items: center;
            `;
        input.inputEl.style.cssText =
            `
            flex-grow:       1;
            margin-right: 10px;
            `;

        disp.innerHTML = 'Enter fullname of your file';

        input.inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.__submit();
            } else if (e.key === "Escape") {
                this.close();
            }
        });

        input.setValue(this._name);
        input.onChange((value) => {
            this._name = value;

            disp.innerHTML = `Enter fullname of your file: ${this._pathgen()}`;
        });

        new ButtonComponent(form)
            .setCta()
            .setIcon('pencil')
            .setButtonText("Create")
            .onClick(() => (this.__submit()));

        new Setting(contentEl)
            .setName(this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_REGISTRY')[0]!)
            .setDesc(this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_REGISTRY')[1]!)
            .addToggle(toggle => {
                toggle
                    .setValue(this._integration)
                    .onChange(async (value) => {
                        this._integration = value;
                    });

                return toggle;
            });

        const includeCodeEditor = new Setting(contentEl)
            .setName(this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_CODE_EDITOR')[0]!)
            .setDesc(this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_CODE_EDITOR')[1]!)
            .setTooltip(this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_CODE_EDITOR')[2]!)
            .addToggle(toggle => {
                toggle
                    .setValue(this._integration_code_editor)
                    .onChange(async (value) => {
                        this._integration_code_editor = value;
                    });

                return toggle;
            });

        const onRfAttention = document.createElement('div');
        onRfAttention.style.fontSize = '80%';
        onRfAttention.style.margin = '10px';
        onRfAttention.style.color = 'darkRed';
        onRfAttention.innerHTML = this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_CODE_EDITOR')[3]!;

        const onRfInfo = document.createElement('div');
        onRfInfo.style.fontWeight = 'bold';
        onRfInfo.style.fontSize = '80%';
        onRfInfo.innerHTML = this.plugin.locale.getLocaleItem('MODAL_INCLUDE_IN_CODE_EDITOR')[4]!;

        includeCodeEditor.nameEl.parentElement!.appendChild(onRfAttention);
        includeCodeEditor.nameEl.parentElement!.appendChild(onRfInfo);
    }

    onClose() {
        const { contentEl } = this;

        contentEl.empty();
    }

    private async __submit() {
        this.close();

        const extensions = this._name.split('.').slice(1).join('>');

        if (this._integration) {
            const next = {
                ...this.plugin.settings,
            };

            next.extensions += `>${extensions}`;

            this.plugin.uptSettings(next);
        }

        if (this._integration_code_editor) {
            const next = {
                ...this.plugin.settings,
            };

            if (this.plugin.settings.code_editor_settings.use_default_extensions)
                next.extensions += `>${extensions}`;
            else
                next.code_editor_settings.extensions += `>${extensions}`;

            this.plugin.uptSettings(next);
        }

        await this.app.vault.create(this._pathgen(), '');

        try {
            this.plugin.apply();
        } catch (error) {
            if (this.plugin.settings.debug_mode)
                console.debug(error);
            else {
                return;
            }
        }
    }

    private _pathgen(): string {
        return this._filepath + "/" + this._name;
    }
} 
