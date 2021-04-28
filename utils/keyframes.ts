const keyframes: {[k: string]: string} = {
    "fade-in-bottom-left": `
      @-webkit-keyframes fade-in-bottom-left{
        from{
            -webkit-opacity: 0;
            -webkit-transform: translate3d(-100%, 100%, 0);
        }
        to{
            -webkit-opacity: 1;
            -webkit-transform: translate3d(0, 0, 0);
        }
    }

    @keyframes fade-in-bottom-left{
        from{
            opacity: 0;
            transform: translate3d(-100%, 100%, 0);
        }
        to{
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
      `,
    "fade-in-bottom-right": `
      @-webkit-keyframes fade-in-bottom-right{
        from{
            -webkit-opacity: 0;
            -webkit-transform: translate3d(100%, 100%, 0);
        }
        to{
            -webkit-opacity: 1;
            -webkit-transform: translate3d(0, 0, 0);
        }
      }

      @keyframes fade-in-bottom-right{
          from{
              opacity: 0;
              transform: translate3d(100%, 100%, 0);
          }
          to{
              opacity: 1;
              transform: translate3d(0, 0, 0);
          }
      }`,
      "fade-in-down": `
        @-webkit-keyframes fade-in-down{
          from{
              -webkit-opacity: 0;
              -webkit-transform: translate3d(0, -100%, 0);
          }
          to{
              -webkit-opacity: 1;
              -webkit-transform: translate3d(0, 0, 0);
          }
        }

        @keyframes fade-in-down{
            from{
                opacity: 0;
                transform: translate3d(0, -100%, 0);
            }
            to{
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }`,
        "fade-in-left": `
          @-webkit-keyframes fade-in-left{
            from{
                -webkit-opacity: 0;
                -webkit-transform: translate3d(-100%, 0, 0);
            }
            to{
                -webkit-opacity: 1;
                -webkit-transform: translate3d(0, 0, 0);
            }
          }

          @keyframes fade-in-left{
              from{
                  opacity: 0;
                  transform: translate3d(-100%, 0, 0);
              }
              to{
                  opacity: 1;
                  transform: translate3d(0, 0, 0);
              }
          }`,
        "fade-in-right": `
            @-webkit-keyframes fade-in-right{
              from{
                  -webkit-opacity: 0;
                  -webkit-transform: translate3d(100%, 0, 0);
              }
              to{
                  -webkit-opacity: 1;
                  -webkit-transform: translate3d(0, 0, 0);
              }
            }

            @keyframes fade-in-right{
                from{
                    opacity: 0;
                    transform: translate3d(100%, 0, 0);
                }
                to{
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }`,
          "fade-in-top-left": `
            @-webkit-keyframes fade-in-top-left{
              from{
                  -webkit-opacity: 0;
                  -webkit-transform: translate3d(-100%, -100%, 0);
              }
              to{
                  -webkit-opacity: 1;
                  -webkit-transform: translate3d(0, 0, 0);
              }
          }

          @keyframes fade-in-top-left{
              from{
                  opacity: 0;
                  transform: translate3d(-100%, -100%, 0);
              }
              to{
                  opacity: 1;
                  transform: translate3d(0, 0, 0);
              }
          }`,
          "fade-in-top-right": `
            @-webkit-keyframes fade-in-top-right{
              from{
                  -webkit-opacity: 0;
                  -webkit-transform: translate3d(100%, -100%, 0);
              }
              to{
                  -webkit-opacity: 1;
                  -webkit-transform: translate3d(0, 0, 0);
              }
            }

            @keyframes fade-in-top-right{
              from{
                  opacity: 0;
                  transform: translate3d(100%, -100%, 0);
              }
              to{
                  opacity: 1;
                  transform: translate3d(0, 0, 0);
              }
            }`,
           "fade-in-up": `
              @-webkit-keyframes fade-in-up{
                from{
                    -webkit-opacity: 0;
                    -webkit-transform: translate3d(0, 100%, 0);
                }
                to{
                    -webkit-opacity: 1;
                    -webkit-transform: translate3d(0, 0, 0);
                }
            }

            @keyframes fade-in-up{
                from{
                    opacity: 0;
                    transform: translate3d(0, 100%, 0);
                }
                to{
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }`,
            "fade-in": `
              @-webkit-keyframes fade-in{
                from{
                    -webkit-opacity: 0;
                }
                to{
                    -webkit-opacity: 1;
                }
            }

            @keyframes fade-in{
                from{
                    opacity: 0;
                }
                to{
                    opacity: 1;
                }
            }`,
            "fade-out-bottom-left": `
              @-webkit-keyframes fade-out-bottom-left{
                from{
                    -webkit-opacity: 1;
                    -webkit-transform: translate3d(0, 0, 0);
                }
                to{
                    -webkit-opacity: 0;
                    -webkit-transform: translate3d(-100%, 100%, 0);
                }
              }

              @keyframes fade-out-bottom-left{
                  from{
                      opacity: 1;
                      transform: translate3d(0, 0, 0);
                  }
                  to{
                      opacity: 0;
                      transform: translate3d(-100%, 100%, 0);
                  }
              }`,
              "fade-out-bottom-right": `
                @-webkit-keyframes fade-out-bottom-right{
                  from{
                      -webkit-opacity: 1;
                      -webkit-transform: translate3d(0, 0, 0);
                  }
                  to{
                      -webkit-opacity: 0;
                      -webkit-transform: translate3d(100%, 100%, 0);
                  }
                }

                @keyframes fade-out-bottom-right{
                    from{
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                    to{
                        opacity: 0;
                        transform: translate3d(100%, 100%, 0);
                    }
                }`,
                "fade-bottom-right": `
                  @-webkit-keyframes fade-out-down{
                    from{
                        -webkit-opacity: 1;
                        -webkit-transform: translate3d(0, 0, 0);
                    }
                    to{
                        -webkit-opacity: 0;
                        -webkit-transform: translate3d(0, 100%, 0);
                    }
                }

                @keyframes fade-out-down{
                    from{
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                    to{
                        opacity: 0;
                        transform: translate3d(0, 100%, 0);
                    }
                }`,
                "fade-out-left": `
                  @-webkit-keyframes fade-out-left{
                    from{
                        -webkit-opacity: 1;
                        -webkit-transform: translate3d(0, 0, 0);
                    }
                    to{
                        -webkit-opacity: 0;
                        -webkit-transform: translate3d(-100%, 0, 0);
                    }
                  }

                  @keyframes fade-out-left{
                      from{
                          opacity: 1;
                          transform: translate3d(0, 0, 0);
                      }
                      to{
                          opacity: 0;
                          transform: translate3d(-100%, 0, 0);
                      }
                  }`,
                "fade-out-right": `
                  @-webkit-keyframes fade-out-right{
                    from{
                        -webkit-opacity: 1;
                        -webkit-transform: translate3d(0, 0, 0);
                    }
                    to{
                        -webkit-opacity: 0;
                        -webkit-transform: translate3d(100%, 0, 0);
                    }
                }

                @keyframes fade-out-right{
                    from{
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                    to{
                        opacity: 0;
                        transform: translate3d(100%, 0, 0);
                    }
                }`,
                "fade-out-top-left": `
                  @-webkit-keyframes fade-out-top-left{
                    from{
                        -webkit-opacity: 1;
                        -webkit-transform: translate3d(0, 0, 0);
                    }
                    to{
                        -webkit-opacity: 0;
                        -webkit-transform: translate3d(-100%, -100%, 0);
                    }
                }

                @keyframes fade-out-top-left{
                    from{
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                    to{
                        opacity: 0;
                        transform: translate3d(-100%, -100%, 0);
                    }
                }`,

  };
  export default keyframes;