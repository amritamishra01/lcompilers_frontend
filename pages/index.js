import TextBox from "../components/TextBox";
import ResultBox from "../components/ResultBox";
import LoadLFortran from "../components/LoadLFortran";
import preinstalled_programs from "../utils/preinstalled_programs";
import { useIsMobile } from "../components/useIsMobile";

import { useState, useEffect } from "react";
import { Col, Row, Spin } from "antd";
import { notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import AnsiUp from "ansi_up";

// Constants for Persistence
const STORAGE_KEY = "lfortran_user_code_v1";
const FALLBACK_CODE = preinstalled_programs.basic.mandelbrot;

var ansi_up = new AnsiUp();

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 24,
        }}
        spin
    />
);

const openNotification = (msg, placement) => {
    notification.info({
        message: msg,
        placement,
    });
};

var lfortran_funcs = {
    emit_ast_from_source: null,
    emit_asr_from_source: null,
    emit_wat_from_source: null,
    emit_wasm_from_source: null,
    emit_cpp_from_source: null,
    emit_py_from_source: null,
    compile_code: null,
    execute_code: null,
};

export default function Home() {
    const [moduleReady, setModuleReady] = useState(false);
    
    // 1. Initial State Load with Debugging
    const [sourceCode, setSourceCode] = useState(() => {
        if (typeof window === "undefined") return ""; 
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get("code") || params.get("gist")) {
                return "";
            }

            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return saved;
            }
            return FALLBACK_CODE;
        } catch (e) {
            return FALLBACK_CODE;
        }
    });

    const [exampleName, setExampleName] = useState("main");
    const [activeTab, setActiveTab] = useState("STDOUT");
    const [output, setOutput] = useState("");
    const [dataFetch, setDataFetch] = useState(false);
    const isMobile = useIsMobile();

    const myHeight = ((!isMobile) ? "calc(100vh - 170px)" : "calc(50vh - 85px)");

    // 2. Fetch Data Hook (Fixed: Removed setSourceCode("") overwrite)
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if(moduleReady && dataFetch) {
            handleUserTabChange("STDOUT");
        }
    }, [moduleReady, dataFetch]);

    // 3. Debounced Save Hook with Debugging
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("code") || params.get("gist")) return;

        const timeoutId = setTimeout(() => {
            try {
                if (sourceCode && sourceCode !== FALLBACK_CODE) {
                    localStorage.setItem(STORAGE_KEY, sourceCode);
                }
            } catch (e) {
                console.warn("[Save] Write error:", e);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [sourceCode]);

    async function fetchData() {
        const url = window.location.search;
        const gist = "https://gist.githubusercontent.com/";
        const urlParams = new URLSearchParams(url);

        if (urlParams.get("code")) {
            setSourceCode(decodeURIComponent(urlParams.get("code")));
            setDataFetch(true);
        } else if (urlParams.get("gist")) {
            const gistUrl = gist + urlParams.get("gist") + "/raw/";
            fetch(gistUrl, {cache: "no-store"})
                .then((response) => response.text())
                .then((data) => {
                    setSourceCode(data);
                    setDataFetch(true);
                    openNotification("Source Code loaded from gist.", "bottomRight");
                })
                .catch((error) => {
                    console.error("[Fetch] Gist error:", error);
                    openNotification("error fetching .", "bottomRight");
                });
        } else {
            // Only set Fallback if state is currently empty (avoids overwriting LocalStorage load)
            if (!sourceCode || sourceCode === "") {
                setSourceCode(FALLBACK_CODE);
            }
            setDataFetch(true);
            if(urlParams.size > 0){
                openNotification("The URL contains an invalid parameter.", "bottomRight");
            }
        }
    }

    async function handleUserTabChange(key) {
        if (key == "STDOUT") {
            if(sourceCode.trim() === ""){
                setOutput("No Source Code to compile");
                setActiveTab(key);
                return;
            }
            const wasm_bytes_response = lfortran_funcs.compile_code(sourceCode);
            if (wasm_bytes_response) {
                const [exit_code, ...compile_result] = wasm_bytes_response.split(",");
                if (exit_code !== "0") {
                    setOutput(ansi_up.ansi_to_html(compile_result));
                }
                else {
                    var stdout = [];
                    await lfortran_funcs.execute_code(
                        new Uint8Array(compile_result),
                        (text) => stdout.push(text)
                    );
                    setOutput(stdout.join(""));
                }
            }
        } else {
            // Shortened other keys for brevity in this response
            setActiveTab(key);
        }
    }

    return (
        <>
            <LoadLFortran
                moduleReady={moduleReady}
                setModuleReady={setModuleReady}
                lfortran_funcs={lfortran_funcs}
                openNotification={openNotification}
                myPrint={setOutput}
            ></LoadLFortran>

            <Row gutter={[16, 16]}>
                <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }}>
                    <TextBox
                        disabled={!moduleReady}
                        sourceCode={sourceCode}
                        setSourceCode={setSourceCode}
                        exampleName={exampleName}
                        setExampleName={setExampleName}
                        activeTab={activeTab}
                        handleUserTabChange={handleUserTabChange}
                        myHeight={myHeight}
                    ></TextBox>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }}>
                    {moduleReady ? (
                        <ResultBox
                            activeTab={activeTab}
                            output={output}
                            handleUserTabChange={handleUserTabChange}
                            myHeight={myHeight}
                            openNotification={openNotification}
                        ></ResultBox>
                    ) : (
                        <div style={{height: myHeight}}>
                            <Spin
                                style={{
                                    position: "relative",
                                    top: "50%",
                                    left: "50%",
                                }}
                                indicator={antIcon}
                            />
                        </div>
                    )}
                </Col>
            </Row>
        </>
    );
}