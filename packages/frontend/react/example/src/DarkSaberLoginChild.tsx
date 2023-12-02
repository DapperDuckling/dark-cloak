import {Box, CircularProgress, Typography} from "@mui/material";
import {useKeycloakConnector} from "@dapperduckling/keycloak-connector-react";
import DarkSaberLogo from "../assets/DarkSaberLogo300x300.webp";

export const DarkSaberLoginChild = () => {

    const [kccContext] = useKeycloakConnector();

    return (
        <>
            <Typography variant="h5">Dark Saber Authenticator</Typography>
            <Box sx={{ position: "relative", height: 210, width: 210 }}>
                <Box
                    component="img"
                    // src={`https://s3-public.devilops.dso.mil/DarkSaberLogo300x300.webp`}
                    src={DarkSaberLogo}
                    height="100%"
                    width="100%"
                    alt="Dark Saber Logo"
                />
                {kccContext.silentLoginInitiated && !kccContext.showMustLoginOverlay && (
                    <>
                        <Box sx={center}>
                            <CircularProgress
                                size={210}
                                thickness={0.5}
                                // @ts-ignore
                                color="black"
                                sx={blackProgress}
                            />
                        </Box>
                        <Box sx={center}>
                            <CircularProgress
                                size={210}
                                thickness={0.5}
                                // @ts-ignore
                                color="red"
                                sx={redProgress}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </>
    );
}

const center = {
    position: "absolute",
    top: "calc(50% + 2px)",
    left: "50%",
    transform: "translate(-50%, -50%)",
    overflow: "hidden",
};
const blackProgress = { animationDuration: "12s", animationDelay: "6s" };
const redProgress = { animationDuration: "12s" };
