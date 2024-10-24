"use client";
import React, { useState, useEffect } from "react";
import { JsonEditor } from "json-edit-react";
import {
  Autocomplete,
  TextField,
  Backdrop,
  CircularProgress,
  Divider,
  Button,
  Icon,
} from "@mui/material";

type IndexSetting = {
  id: string;
  videoPrompt?: string;
  schemaDescription?: string;
  jsonSchema?: { [key: string]: number | string | boolean };
};

const VideoParsingSettings = (props: { parsingSettings: IndexSetting[] }) => {
  //const [indexes, setIndexes] = useState([]);
  const { parsingSettings } = props;
  const [indexes, setIndexes] = useState<{ [key: string]: any }[]>();
  const [index, setIndex] = useState<string | null>(null);
  const [videos, setVideos] = useState<{ [key: string]: any }[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);

  async function fetchIndexes(apiKey?: string) {
    setProcessing(true);
    const response = await fetch("/api/getIndexes", {
      headers: {
        Authorization: apiKey || "",
      },
    });
    setProcessing(false);
    if (!response.ok) {
      alert("La récupération des indexes a échoué !");
      return;
    }
    let indexes: IndexSetting[] = await response.json();
    indexes = indexes.map((index: IndexSetting) => {
      const existingIndex = parsingSettings.find(
        (setting) => setting.id === index.id
      );
      if (existingIndex) {
        return {
          ...index,
          videoPrompt: existingIndex.videoPrompt,
          schemaDescription: existingIndex.schemaDescription,
          jsonSchema: existingIndex.jsonSchema,
        };
      }
      return index;
    }) as IndexSetting[];

    setIndexes(indexes);
  }

  function updateIndexes(
    id: string,
    updatedKey: "videoPrompt" | "schemaDescription" | "jsonSchema",
    value: any
  ) {
    console.log("id", id, "updatedKey", updatedKey, "value", value);
    const newIndexes = indexes?.map((index) => {
      if (index.id === id) {
        return {
          ...index,
          [updatedKey]: value,
        };
      }
      return index;
    });
    console.log("newIndexes", newIndexes);
    setIndexes(newIndexes);
  }

  const fetchVideos = async (id: string, apiKey?: string) => {
    setProcessing(true);
    const response = await fetch(`/api/getVideos?id=${id}`, {
      headers: {
        Authorization: apiKey || "",
      },
    });
    setProcessing(false);
    if (!response.ok) {
      alert("La récupération des vidéos a échoué !");
    }
    return response.json();
  };

  const executeParsing = async (videoId: string) => {
    setProcessing(true);
    const correspondingSettings = indexes?.find((i) => i.id === index);
    const apiKey = (document.getElementsByName("apiKey")[0] as HTMLInputElement)
      .value;
    const response = await fetch("/api/parser", {
      method: "POST",
      body: JSON.stringify({
        id: videoId,
        videoPrompt: correspondingSettings?.videoPrompt,
        schemaDescription: correspondingSettings?.schemaDescription,
        jsonSchema: correspondingSettings?.jsonSchema,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey || "",
      },
    });
    setProcessing(false);
    if (!response.ok) {
      alert("Le parsing a échoué !");
      return;
    }
    const data = await response.json();
    setResponse(data);
    return data;
  };

  const updateSettings = async () => {
    setProcessing(true);
    const correspondingSettings = indexes?.find((i) => i.id === index);
    const response = await fetch("/api/parsing_settings", {
      method: "PUT",
      body: JSON.stringify({
        id: index,
        name: correspondingSettings?.name,
        videoPrompt: correspondingSettings?.videoPrompt,
        schemaDescription: correspondingSettings?.schemaDescription,
        jsonSchema: correspondingSettings?.jsonSchema,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setProcessing(false);
    if (!response.ok) {
      alert("La mise à jour des paramètres a échoué !");
    } else {
      alert("Les paramètres ont été mis à jour avec succès !");
    }
    return response.json();
  };

  useEffect(() => {
    if (index) {
      const apiKey = (
        document.getElementsByName("apiKey")[0] as HTMLInputElement
      ).value;
      fetchVideos(index, apiKey)
        .then(
          (
            videos: {
              id: string;
              title: string;
              duration: number;
              source: { [key: string]: string };
            }[]
          ) => {
            setVideos(videos);
            //setSettings(indexes.find((i) => i.id === index) || {});
          }
        )
        .catch((error) => {
          console.error("Failed to fetch videos:", error);
        });
    }
  }, [index]);

  console.log("indexes", indexes);
  const selectedParsingSettings =
    indexes && indexes.length > 0 ? indexes.find((i) => i.id === index) : {};

  return (
    <>
      <div id="apiKey" style={{ display: "flex", alignItems: "center" }}>
        <TextField
          style={{ margin: 10 }}
          label="TwelveLab API Key"
          name="apiKey"
          type="password"
          onChange={(e) => {
            // Store the API key securely, e.g., in state or context
            console.log("API Key:", e.target.value);
          }}
          fullWidth
        />
        <Button
          style={{ margin: 10 }}
          variant="contained"
          onClick={() => {
            const apiKey = (
              document.getElementsByName("apiKey")[0] as HTMLInputElement
            ).value;
            fetchIndexes(apiKey);
          }}
        >
          <Icon>send</Icon>
        </Button>
      </div>
      {indexes ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            flex: 2,
          }}
        >
          <div id="leftBlock" style={{ flex: 1, padding: 12 }}>
            <h2> Choisir un indexe Twelvelab </h2>
            <Autocomplete
              options={indexes as any[]}
              getOptionLabel={(option: { name: string; id: string }) =>
                option.name
              }
              renderInput={(params) => <TextField {...params} label="Index" />}
              onChange={(
                event,
                newValue: { name: string; id: string } | null
              ) => {
                setIndex(newValue?.id || null);
              }}
            />

            <h2> Sélectionner une vidéo </h2>
            {videos?.length > 0 && (
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Titre
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Durée (secondes)
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Sélectionner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        {video.title}
                      </td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        {video.duration}
                      </td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        <button
                          onClick={() => executeParsing(video.id)}
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          🎥
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Divider />
            {index && (
              <div id="settings" style={{ marginTop: 24 }}>
                <h2> Gérer le paramètrage </h2>

                <TextField
                  style={{ margin: 10 }}
                  label="Prompt"
                  value={selectedParsingSettings?.videoPrompt || ""}
                  onChange={(e) =>
                    updateIndexes(index, "videoPrompt", e.target.value)
                  }
                  //has to be a textarea
                  multiline
                  rows={5}
                  fullWidth
                  autoCapitalize="sentences"
                />

                <TextField
                  style={{ margin: 10 }}
                  label="Description"
                  value={selectedParsingSettings?.schemaDescription || ""}
                  onChange={(e) =>
                    updateIndexes(index, "schemaDescription", e.target.value)
                  }
                  //has to be a textarea
                  multiline
                  rows={5}
                  fullWidth
                  autoCapitalize="sentences"
                />

                <JsonEditor
                  data={selectedParsingSettings?.jsonSchema || {}}
                  onUpdate={(newData) =>
                    updateIndexes(index, "jsonSchema", newData.newData)
                  }
                />
                <Button
                  style={{ margin: 10 }}
                  variant="contained"
                  onClick={updateSettings}
                >
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
          <div id="rightBlock" style={{ flex: 1, padding: 12 }}>
            <Backdrop
              sx={(theme) => ({
                color: "#fff",
                zIndex: theme.zIndex.drawer + 1,
              })}
              open={processing}
              onClick={() => setProcessing(false)}
            >
              <CircularProgress color="inherit" size={100} />
            </Backdrop>

            {response && (
              <div>
                <h2 key="extraits"> Extraits </h2>
                <video
                  key="extraitVideo"
                  controls
                  src={`/api/getVideo?id=${response.videoId}`}
                />
                <h2 key="responseTitle"> Response </h2>
                <JsonEditor
                  key="jsonResponse"
                  data={response}
                  restrictAdd={true}
                  restrictDelete={true}
                  restrictTypeSelection={true}
                  restrictEdit={true}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default VideoParsingSettings;
