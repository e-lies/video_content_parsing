"use client";
import React, { useState, useEffect } from "react";
import { JsonEditor } from "json-edit-react";
import {
  Autocomplete,
  TextField,
  Backdrop,
  CircularProgress,
} from "@mui/material";

const VideoParsingSettings = (props: {
  indexes: {
    id: string;
    ind: number;
    videoPrompt: string;
    schemaDescription: string;
    jsonSchema: { [key: string]: number | string | boolean };
  }[];
}) => {
  //const [indexes, setIndexes] = useState([]);
  const { indexes } = props;
  const [index, setIndex] = useState<string | null>(null);
  const [videos, setVideos] = useState<{ [key: string]: any }[]>([]);
  const [settings, setSettings] = useState<{ [key: string]: any }>({});
  const [video, setVideo] = useState(null);
  const [response, setResponse] = useState(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const fetchVideos = async (id: string) => {
    setProcessing(true);
    const response = await fetch(`/api/getVideos?id=${id}`);
    setProcessing(false);
    if (!response.ok) {
      alert("La récupération des vidéos a échoué !");
    }
    return response.json();
  };

  const executeParsing = async () => {
    setProcessing(true);
    const response = await fetch("/api/parser", {
      method: "POST",
      body: JSON.stringify({
        ...settings,
        id: video,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setProcessing(false);
    if (!response.ok) {
      alert("Le parsing a échoué !");
    }
    return response.json();
  };

  useEffect(() => {
    if (index) {
      fetchVideos(index)
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
            setSettings(indexes.find((i) => i.id === index) || {});
          }
        )
        .catch((error) => {
          console.error("Failed to fetch videos:", error);
        });
    }
  }, [index]);

  useEffect(() => {
    if (video) {
      executeParsing()
        .then((response) => {
          setResponse(response);
        })
        .catch((error) => {
          console.error("Failed to execute parsing:", error);
        });
    }
  }, [video]);

  return indexes ? (
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
          getOptionLabel={(option: { name: string; id: string }) => option.name}
          renderInput={(params) => <TextField {...params} label="Index" />}
          onChange={(event, newValue: { name: string; id: string } | null) => {
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
                      onClick={() => setVideo(video.id)}
                      style={{
                        cursor: "pointer",
                        marginRight: 8,
                        display: "block",
                        marginLeft: "auto",
                        border: "none",
                        backgroundColor: "transparent",
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

        {index && (
          <div id="settings" style={{ marginTop: 24 }}>
            <h2> Gérer le paramètrage </h2>

            <TextField
              label="Prompt"
              value={settings?.videoPrompt || ""}
              onChange={(e) =>
                setSettings({ ...settings, videoPrompt: e.target.value })
              }
              //has to be a textarea
              multiline
              rows={5}
              fullWidth
              autoCapitalize="sentences"
            />

            <JsonEditor
              data={settings?.jsonSchema || {}}
              onUpdate={(newData) => {
                console.log("newData = ", newData);
                setSettings({ ...settings, jsonSchema: newData.newData });
              }}
            />
          </div>
        )}
      </div>
      <div id="rightBlock" style={{ flex: 1, padding: 12 }}>
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={processing}
          onClick={() => setProcessing(false)}
        >
          <CircularProgress color="inherit" size={100} />
        </Backdrop>
        <button
          style={{
            width: "100%",
            padding: 10,
            fontSize: 20,
            backgroundColor: "lightblue",
            cursor: "pointer",
          }}
          onClick={executeParsing}
        >
          Parse
        </button>
        <h2> Extraits </h2>
        {video && <video controls src={`/api/getVideo?id=${video}`} />}
        {response && (
          <div>
            <h2> Response </h2>
            <JsonEditor
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
  );
};

export default VideoParsingSettings;
