import { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { ArrowLeftIcon, CameraIcon, LoaderIcon, MailIcon, MapPinIcon, SaveIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import { getErrorMessage } from "../lib/utils";
import { useNavigate } from "react-router";
import ProfileAvatar from "../components/ProfileAvatar";

const OnboardingPage = ({ editMode = false }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  useEffect(() => {
    if (!authUser) return;
    setFormState({
      fullName: authUser.fullName || "",
      bio: authUser.bio || "",
      nativeLanguage: authUser.nativeLanguage || "",
      learningLanguage: authUser.learningLanguage || "",
      location: authUser.location || "",
      profilePic: authUser.profilePic || "",
    });
  }, [authUser]);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: async () => {
      toast.success(editMode ? "Profile updated successfully" : "Profile onboarded successfully");
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      if (!editMode) navigate("/");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not complete onboarding."));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className={`min-h-screen bg-base-100 ${editMode ? "p-4 sm:p-6 lg:p-8" : "flex items-center justify-center p-4"}`}>
      <div className={`card bg-base-200 w-full ${editMode ? "max-w-4xl mx-auto" : "max-w-3xl mx-auto"} shadow-xl border border-base-300/70`}>
        <div className="card-body p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                {editMode && (
                  <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={() => navigate(-1)} aria-label="Go back">
                    <ArrowLeftIcon className="size-5" />
                  </button>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold">{editMode ? "Profile Settings" : "Complete Your Profile"}</h1>
              </div>
              <p className="text-sm opacity-65 mt-1">
                {editMode
                  ? "Keep your profile details up to date so language partners know what to expect."
                  : "Tell the community about yourself and your language-learning goals."}
              </p>
            </div>
            {editMode && (
              <div className="hidden sm:block">
                <ProfileAvatar name={formState.fullName} src={formState.profilePic} size="size-14" textSize="text-base" />
              </div>
            )}
          </div>

          {editMode && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl bg-base-100 border border-base-300/70 p-4">
                <p className="text-xs uppercase tracking-wide opacity-50">Account</p>
                <p className="font-medium mt-1 truncate">{authUser?.email}</p>
              </div>
              <div className="rounded-2xl bg-base-100 border border-base-300/70 p-4">
                <p className="text-xs uppercase tracking-wide opacity-50">Native language</p>
                <p className="font-medium mt-1 capitalize">{formState.nativeLanguage || "Not set"}</p>
              </div>
              <div className="rounded-2xl bg-base-100 border border-base-300/70 p-4">
                <p className="text-xs uppercase tracking-wide opacity-50">Learning</p>
                <p className="font-medium mt-1 capitalize">{formState.learningLanguage || "Not set"}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="relative">
                <ProfileAvatar
                  name={formState.fullName}
                  src={formState.profilePic}
                  size="size-32"
                  textSize="text-3xl"
                />
                {!formState.profilePic && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <CameraIcon className="size-10 opacity-20" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <label className="input input-bordered w-full flex items-center gap-2 opacity-80">
                <MailIcon className="size-4 opacity-60" />
                <input type="email" value={authUser?.email || ""} readOnly className="grow bg-transparent" />
                <span className="badge badge-ghost badge-sm">Account</span>
              </label>
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  {editMode ? <SaveIcon className="size-5 mr-2" /> : <ShipWheelIcon className="size-5 mr-2" />}
                  {editMode ? "Save Profile Changes" : "Complete Onboarding"}
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  {editMode ? "Saving..." : "Onboarding..."}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
